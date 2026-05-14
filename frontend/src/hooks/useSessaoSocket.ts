import { useEffect, useRef } from 'react';
import { acquireSocket, releaseSocket, type Socket } from '@/services/socket';

interface SessaoEventHandlers {
  onPresencaNova?: (payload: unknown) => void;
  onPerguntaDisparada?: (payload: unknown) => void;
  onPerguntaEncerrada?: (payload: unknown) => void;
  onRespostaRecebida?: (payload: unknown) => void;
  onSessaoEncerrada?: (payload: unknown) => void;
}

/**
 * Hook que cuida do ciclo de vida do Socket.IO atrelado a uma sessão.
 * - Adquire o socket singleton, entra na room `sessao:<id>`
 * - Registra handlers fornecidos
 * - Sai da room e libera o socket no unmount
 *
 * Os handlers podem ser passados sem useCallback porque usamos ref interno —
 * mudar handlers entre renders não reinicia o socket.
 */
export function useSessaoSocket(sessaoId: number | null, handlers: SessaoEventHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!sessaoId) return;

    const socket: Socket = acquireSocket();

    const join = () => {
      socket.emit('sessao:join', { sessaoId });
    };

    // Pode já estar conectado, ou conectar depois — cobre os dois casos
    if (socket.connected) {
      join();
    } else {
      socket.once('connect', join);
    }

    const onPresenca = (p: unknown) => handlersRef.current.onPresencaNova?.(p);
    const onPergunta = (p: unknown) => handlersRef.current.onPerguntaDisparada?.(p);
    const onPerguntaFim = (p: unknown) => handlersRef.current.onPerguntaEncerrada?.(p);
    const onResposta = (p: unknown) => handlersRef.current.onRespostaRecebida?.(p);
    const onSessaoFim = (p: unknown) => handlersRef.current.onSessaoEncerrada?.(p);

    socket.on('sessao:presenca-nova', onPresenca);
    socket.on('sessao:pergunta-disparada', onPergunta);
    socket.on('sessao:pergunta-encerrada', onPerguntaFim);
    socket.on('sessao:resposta-recebida', onResposta);
    socket.on('sessao:encerrada', onSessaoFim);

    return () => {
      socket.emit('sessao:leave', { sessaoId });
      socket.off('sessao:presenca-nova', onPresenca);
      socket.off('sessao:pergunta-disparada', onPergunta);
      socket.off('sessao:pergunta-encerrada', onPerguntaFim);
      socket.off('sessao:resposta-recebida', onResposta);
      socket.off('sessao:encerrada', onSessaoFim);
      releaseSocket();
    };
  }, [sessaoId]);
}
