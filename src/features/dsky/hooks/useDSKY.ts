import { useState, useEffect, useCallback, useRef } from 'react';
import { useDSKYState } from './useDSKYState';
import { useWeb3State } from '../../../hooks/useWeb3State';
import { useCoinList } from '../../../hooks/useCoinList';
import { UnifiedWeb3Service } from '../../../services/web3/UnifiedWeb3Service';
import { DSKYCommandExecutor } from '../../../services/dsky/DSKYCommandExecutor';
import { DSKYInputHandler } from '../../../services/dsky/DSKYInputHandler';
import { DynamicCryptoPriceService } from '../../../services/crypto/DynamicCryptoPriceService';
import type { IInputState } from '../../../interfaces/IInputState';
import type { IWeb3State } from '../../../interfaces/IWeb3State';
import type { ICoinListManager } from '../../../interfaces/ICoinListManager';
import type { IDSKYState } from '../../../interfaces/IDSKYState';
import { STATUS_MESSAGES, ALCHEMY_CONFIG } from '../../../constants/DSKYConstants';
import type { StatusMessageHandler } from '../../../types/StatusMessageHandler';
import { InputMode } from '../../../interfaces/InputMode';

interface IUseDSKY {
  dskyState: IDSKYState;
  web3State: IWeb3State;
  coinListManager: ICoinListManager;
  inputMode: InputMode;
  currentInput: string;
  statusMessages: string[];
  isProcessing: boolean;
  handleKeyPress: (key: string) => void;
}

export const useDSKY = (): IUseDSKY => {
  const dskyStateManager = useDSKYState();
  const web3StateManager = useWeb3State();
  const coinListManager = useCoinList();
  
  const [inputMode, setInputMode] = useState(InputMode.None);
  const [currentInput, setCurrentInput] = useState('');
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const servicesRef = useRef({
    web3Service: null as UnifiedWeb3Service | null,
    commandExecutor: null as DSKYCommandExecutor | null,
    inputHandler: null as DSKYInputHandler | null,
    cryptoPriceService: null as DynamicCryptoPriceService | null
  });
  
  const actionsRef = useRef({
    dskyActions: dskyStateManager.actions,
    web3Actions: web3StateManager.actions,
    isConnected: false
  });

  useEffect(() => {
    actionsRef.current.dskyActions = dskyStateManager.actions;
  }, [dskyStateManager.actions]);
  
  useEffect(() => {
    actionsRef.current.web3Actions = web3StateManager.actions;
    actionsRef.current.isConnected = web3StateManager.state.isConnected;
  }, [web3StateManager.actions, web3StateManager.state.isConnected]);
  const addStatusMessage: StatusMessageHandler = useCallback((message: string) => {
    setStatusMessages(prev => {
      const capped = [...prev, message];
      return capped.length > 50 ? capped.slice(-50) : capped;
    });
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        servicesRef.current.web3Service = UnifiedWeb3Service.createForHardhat(ALCHEMY_CONFIG.DEFAULT_API_KEY);
        servicesRef.current.commandExecutor = new DSKYCommandExecutor(
          servicesRef.current.web3Service,
          coinListManager
        );
        servicesRef.current.inputHandler = new DSKYInputHandler();
        servicesRef.current.cryptoPriceService = new DynamicCryptoPriceService();
          await coinListManager.actions.loadCoinList();
        
        addStatusMessage(STATUS_MESSAGES.WEB3_INITIALIZED);
        addStatusMessage('Dynamic coin system initialized');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addStatusMessage(`${STATUS_MESSAGES.WEB3_NOT_INITIALIZED}: ${errorMessage}`);
        actionsRef.current.dskyActions.setStatusLight('oprErr', true);
      }
    };
    
    initializeServices();
  }, [addStatusMessage, coinListManager]);

  const executeCommand = useCallback(async (verb: string, noun: string) => {
    if (!servicesRef.current.commandExecutor) {
      addStatusMessage(STATUS_MESSAGES.WEB3_NOT_INITIALIZED);
      actionsRef.current.dskyActions.setStatusLight('oprErr', true);
      return;
    }

    setIsProcessing(true);
    actionsRef.current.dskyActions.setStatusLight('compActy', true);
    actionsRef.current.dskyActions.setStatusLight('oprErr', false);

    try {
      const result = await servicesRef.current.commandExecutor.execute(verb, noun, web3StateManager.state);
      
      if (result.dskyUpdates) {
        actionsRef.current.dskyActions.updateMultipleFields(result.dskyUpdates);
      }
      
      if (result.web3Updates) {
        if (result.web3Updates.isConnected !== undefined) {
          if (result.web3Updates.isConnected) {
            actionsRef.current.web3Actions.updateConnection(
              result.web3Updates.account || '',
              result.web3Updates.network || undefined
            );
          } else {
            actionsRef.current.web3Actions.disconnect();
          }
        }
        if (result.web3Updates.balance) {
          actionsRef.current.web3Actions.updateBalance(result.web3Updates.balance);
        }
        if (result.web3Updates.network) {
          actionsRef.current.web3Actions.updateNetwork(result.web3Updates.network);
        }
      }
      
      if (result.statusMessage) {
        addStatusMessage(result.statusMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addStatusMessage(`Command execution failed: ${errorMessage}`);
      actionsRef.current.dskyActions.setStatusLight('oprErr', true);
    } finally {
      setIsProcessing(false);
      actionsRef.current.dskyActions.setStatusLight('compActy', false);
    }
  }, [addStatusMessage, web3StateManager.state]);

  const handleKeyPress = useCallback((key: string) => {
    if (!servicesRef.current.inputHandler) return;

    const inputState: IInputState = { mode: inputMode, currentInput };
    const result = servicesRef.current.inputHandler.handleKeyPress(
      key,
      inputState,
      dskyStateManager.state
    );

    setInputMode(result.newInputState.mode);
    setCurrentInput(result.newInputState.currentInput);

    if (result.statusMessage) {
      addStatusMessage(result.statusMessage);
    }

    if (result.dskyUpdates) {
      actionsRef.current.dskyActions.updateMultipleFields(result.dskyUpdates);
    }

    if (result.shouldExecuteCommand) {
      executeCommand(result.shouldExecuteCommand.verb, result.shouldExecuteCommand.noun);
    }
  }, [inputMode, currentInput, addStatusMessage, executeCommand, dskyStateManager.state]);

  useEffect(() => {
    const interval = setInterval(() => {
      actionsRef.current.dskyActions.updateMultipleFields({
        compActy: isProcessing || Math.random() > 0.85,
        uplinkActy: actionsRef.current.isConnected
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);
  return {
    dskyState: dskyStateManager.state,
    web3State: web3StateManager.state,
    coinListManager,
    inputMode,
    currentInput,
    statusMessages,
    isProcessing,
    handleKeyPress
  };
};
