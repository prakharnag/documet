'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VoiceChatProps {
  DocumentId: string;
  DocumentTitle: string;
}

export default function VoiceChat({ DocumentId, DocumentTitle }: VoiceChatProps) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to start');
  const vapiRef = useRef<any>(null);

  const startVoiceAgent = async () => {
    try {
      setStatus('Starting Vapi voice agent...');
      
      // Get document context
      const docResponse = await fetch(`/api/Documents/public/${DocumentId}`);
      const docData = await docResponse.json();
      
      // Initialize Vapi
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;
      
      vapi.on('call-start', () => {
        setIsActive(true);
        setStatus('Voice agent active - speak naturally!');
      });
      
      vapi.on('call-end', () => {
        setIsActive(false);
        setStatus('Voice agent stopped');
      });
      
      vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setStatus('Voice agent error');
      });
      
      // Start Vapi call with assistant ID and document context
      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          documentTitle: DocumentTitle,
          documentContent: docData.DocumentText?.substring(0, 3000) || ''
        }
      };
      
      await vapi.start('a89ca1bc-cf62-4cb6-9e1d-d2c2fdcf053a', assistantOverrides);
      
      // Send document context as system message
      setTimeout(() => {
        vapi.send({
          type: 'add-message',
          message: {
            role: 'system',
            content: `You are answering questions about the document "${DocumentTitle}". Document content: ${docData.DocumentText?.substring(0, 2000) || ''}`
          }
        });
      }, 1000);
      
    } catch (error) {
      console.error('Vapi start error:', error);
      setStatus('Failed to start voice agent');
    }
  };

  const stopVoiceAgent = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setIsActive(false);
    setStatus('Voice agent stopped');
  };

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative">
      {!isActive ? (
        <Button
          onClick={startVoiceAgent}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <Phone className="w-4 h-4" />
          <span>Voice Agent</span>
        </Button>
      ) : (
        <Button
          onClick={stopVoiceAgent}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-green-50 border-green-300 text-green-700"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Stop Voice</span>
        </Button>
      )}
    </div>
  );
}