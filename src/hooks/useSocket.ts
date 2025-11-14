import { useEffect, useState, useRef, useCallback } from "react"
import io, { type Socket } from "socket.io-client"
import config from "@/config"

export function useSocket() {
      const [isConnected, setIsConnected] = useState(false)
      const socketRef = useRef<Socket | null>(null)

      useEffect(() => {
            const apiUrl = config?.socketBaseUrl;

            socketRef.current = io(apiUrl, {
                  /* auth: { token: accessToken },
                  transports: ["websocket"], */
                  reconnection: true,
            });

            socketRef.current.on("connect", () => {
                  console.log("Socket connected:", socketRef.current?.id)
                  setIsConnected(true)
            })

            socketRef.current.on("disconnect", () => {
                  console.log("Socket disconnected")
                  setIsConnected(false)
            })

            return () => {
                  socketRef.current?.disconnect()
            }
      }, []);


      const emit = useCallback((event: string, data: any) => {
            if (socketRef.current?.connected) {
                  socketRef.current.emit(event, data)
            }
      }, [])

      const on = useCallback((event: string, callback: (data: any) => void) => {
            if (socketRef.current) {
                  socketRef.current.on(event, callback)
            }
      }, [])

      const off = useCallback((event: string, callback?: (data: any) => void) => {
            if (socketRef.current) {
                  socketRef.current.off(event, callback)
            }
      }, [])

      return { isConnected, emit, on, off }
}
