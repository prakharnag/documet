'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VoiceChatProps {
  DocumentId: string;
  DocumentTitle: string;
  userId?: string;
  buttonClassName?: string;
}

export default function VoiceChat({ DocumentId, DocumentTitle, userId, buttonClassName }: VoiceChatProps) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('');
  const vapiRef = useRef<any>(null);

  const startVoiceAgent = async () => {
    try {
      
      // Get document context first
      const docResponse = await fetch(`/api/Documents/public/${DocumentId}`);
      const docData = await docResponse.json();
      
      // Initialize Vapi
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;
      
      vapi.on('call-start', () => {
        setIsActive(true);
        
        // Send document context as system message after call starts
        setTimeout(() => {
          vapi.send({
            type: 'add-message',
            message: {
              role: 'system',
              content: `You are answering questions about the document "${DocumentTitle}". Here is the document content: ${docData.DocumentText?.substring(0, 3000) || 'Document content not available'}`
            }
          });
        }, 1000);
      });
      
      vapi.on('call-end', () => {
        setIsActive(false);
      });
      
      vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setStatus('Voice agent error');
        setIsActive(false);
      });

      // Start Vapi call with assistant ID
      await vapi.start('a89ca1bc-cf62-4cb6-9e1d-d2c2fdcf053a', {
        variableValues: {
          documentTitle: DocumentTitle,
          documentId: DocumentId
        }
      });
      
    } catch (error) {
      console.error('Vapi start error:', error);
      setStatus('Failed to start voice agent');
      setIsActive(false);
    }
  };

  const stopVoiceAgent = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setIsActive(false);
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
          className={buttonClassName || "flex items-center gap-1 px-2 h-8 text-xs sm:px-3 sm:h-9 sm:text-sm whitespace-nowrap"}
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Voice Agent</span>
        </Button>
      ) : (
        <Button
          onClick={stopVoiceAgent}
          variant="outline"
          size="sm"
          className={buttonClassName || "flex items-center gap-1 px-2 h-8 text-xs sm:px-3 sm:h-9 sm:text-sm bg-orange-50 border-orange-300 text-orange-700 whitespace-nowrap"}
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Stop</span>
        </Button>
      )}
      {status && (
        <div className="absolute top-full mt-1 text-xs text-stone-600 whitespace-nowrap">
          {status}
        </div>
      )}
    </div>
  );
}