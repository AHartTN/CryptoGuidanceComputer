/**
 * @fileoverview Main DSKY hook with optimized state management
 * @description Central hook combining all DSKY functionality with proper separation of concerns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDSKYState } from './useDSKYState';
import { useWeb3State } from './useWeb3State';
import { UnifiedWeb3Service } from '../services/UnifiedWeb3Service';
import { DSKYCommandExecutor } from '../services/DSKYCommandExecutor';
import { DSKYInputHandler } from '../services/DSKYInputHandler';
import type { 
  InputMode, 
  IInputState,
  IDSKYState,
  IWeb3State,
  StatusMessageHandler 
} from '../types';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ALCHEMY_CONFIG } from '../constants';

/**
 * Main DSKY hook interface
 */
interface IUseDSKY {
  dskyState: IDSKYState;
  web3State: IWeb3State;
  inputMode: InputMode;
  currentInput: string;
  statusMessages: string[];
  isProcessing: boolean;
  handleKeyPress: (key: string) => void;
}

/**
 * Main DSKY hook combining all functionality
 * @returns Consolidated DSKY interface
 */
export const useDSKY = (): IUseDSKY => {
  const dskyStateManager = useDSKYState();
  const web3StateManager = useWeb3State();
  
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const servicesRef = useRef({
    web3Service: null as UnifiedWeb3Service | null,
    commandExecutor: null as DSKYCommandExecutor | null,
    inputHandler: null as DSKYInputHandler | null
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
    setStatusMessages(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        servicesRef.current.web3Service = UnifiedWeb3Service.createForHardhat(ALCHEMY_CONFIG.DEFAULT_API_KEY);
        servicesRef.current.commandExecutor = new DSKYCommandExecutor(servicesRef.current.web3Service);
        servicesRef.current.inputHandler = new DSKYInputHandler();
        
        addStatusMessage(SUCCESS_MESSAGES.WEB3_INITIALIZED);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addStatusMessage(`${ERROR_MESSAGES.WEB3_NOT_INITIALIZED}: ${errorMessage}`);
        actionsRef.current.dskyActions.setStatusLight('oprErr', true);
      }
    };

    initializeServices();
  }, [addStatusMessage]);

  const executeCommand = useCallback(async (verb: string, noun: string) => {
    if (!servicesRef.current.commandExecutor) {
      addStatusMessage(ERROR_MESSAGES.WEB3_NOT_INITIALIZED);
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
    inputMode,
    currentInput,
    statusMessages,
    isProcessing,
    handleKeyPress
  };
};
