// Main DSKY hook that combines all functionality following SOLID principles

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDSKYState } from './useDSKYState';
import { useWeb3State } from './useWeb3State';
import { UnifiedWeb3Service } from '../services/UnifiedWeb3Service';
import { DSKYCommandExecutor } from '../services/DSKYCommandExecutor';
import { DSKYInputHandler, InputMode } from '../services/DSKYInputHandler';
import { STATUS_MESSAGES } from '../constants/DSKYConstants';

export const useDSKY = () => {
  // State hooks
  const dskyState = useDSKYState();
  const web3State = useWeb3State();
  
  // Local state
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Service references
  const web3ServiceRef = useRef<UnifiedWeb3Service | null>(null);
  const commandExecutorRef = useRef<DSKYCommandExecutor | null>(null);
  const inputHandlerRef = useRef<DSKYInputHandler | null>(null);

  // Add status message helper
  const addStatusMessage = useCallback((message: string) => {
    setStatusMessages(prev => [...prev, message]);
  }, []);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const alchemyApiKey = 'demo-key';
        
        // Initialize Web3 service
        web3ServiceRef.current = UnifiedWeb3Service.createForHardhat(alchemyApiKey);
        
        // Initialize command executor
        commandExecutorRef.current = new DSKYCommandExecutor(web3ServiceRef.current);
        
        // Initialize input handler
        inputHandlerRef.current = new DSKYInputHandler();
        
        addStatusMessage(STATUS_MESSAGES.WEB3_INITIALIZED);
      } catch (error) {
        addStatusMessage(STATUS_MESSAGES.WEB3_INIT_FAILED(String(error)));
        dskyState.setStatusLight('oprErr', true);
      }
    };

    initializeServices();
  }, [dskyState, addStatusMessage]);

  // Execute command
  const executeCommand = useCallback(async (verb: string, noun: string) => {
    if (!commandExecutorRef.current) {
      addStatusMessage(STATUS_MESSAGES.WEB3_NOT_INITIALIZED);
      dskyState.setStatusLight('oprErr', true);
      return;
    }

    setIsProcessing(true);
    dskyState.setStatusLight('compActy', true);
    dskyState.setStatusLight('oprErr', false);

    try {
      const result = await commandExecutorRef.current.execute(verb, noun, web3State.state);
      
      // Apply updates
      if (result.dskyUpdates) {
        dskyState.updateMultipleFields(result.dskyUpdates);
      }
      if (result.web3Updates) {
        if (result.web3Updates.isConnected !== undefined) {
          if (result.web3Updates.isConnected) {
            web3State.updateConnection(
              result.web3Updates.account || '',
              result.web3Updates.network || undefined
            );
          } else {
            web3State.disconnect();
          }
        }
        if (result.web3Updates.balance) {
          web3State.updateBalance(result.web3Updates.balance);
        }
        if (result.web3Updates.network) {
          web3State.updateNetwork(result.web3Updates.network);
        }
      }
      
      addStatusMessage(result.statusMessage);
    } catch (error) {
      addStatusMessage(`Command execution failed: ${error}`);
      dskyState.setStatusLight('oprErr', true);
    } finally {
      setIsProcessing(false);
      dskyState.setStatusLight('compActy', false);
    }
  }, [dskyState, web3State, addStatusMessage]);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    if (!inputHandlerRef.current) return;

    const result = inputHandlerRef.current.handleKeyPress(
      key,
      { mode: inputMode, currentInput },
      dskyState.state
    );

    // Update input state
    setInputMode(result.newInputState.mode);
    setCurrentInput(result.newInputState.currentInput);

    // Add status message if provided
    if (result.statusMessage) {
      addStatusMessage(result.statusMessage);
    }

    // Apply DSKY updates if provided
    if (result.dskyUpdates) {
      dskyState.updateMultipleFields(result.dskyUpdates);
    }

    // Execute command if requested
    if (result.shouldExecuteCommand) {
      executeCommand(result.shouldExecuteCommand.verb, result.shouldExecuteCommand.noun);
    }
  }, [inputMode, currentInput, dskyState, addStatusMessage, executeCommand]);

  // Simulate computer activity and connection status
  useEffect(() => {
    const interval = setInterval(() => {
      dskyState.updateMultipleFields({
        compActy: isProcessing || Math.random() > 0.85,
        uplinkActy: web3State.state.isConnected
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, web3State.state.isConnected, dskyState]);

  return {
    // State
    dskyState: dskyState.state,
    web3State: web3State.state,
    inputMode,
    currentInput,
    statusMessages,
    isProcessing,
    
    // Actions
    handleKeyPress
  };
};