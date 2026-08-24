package com.ohhiokbye.sync.server.controller;

import com.ohhiokbye.sync.server.model.SyncMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SyncController {

    // When the client sends to /app/sync/{roomId}, we broadcast to /topic/room/{roomId}
    @MessageMapping("/sync/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public SyncMessage handleSyncMessage(@DestinationVariable String roomId, @Payload SyncMessage message) {
        System.out.println("Room " + roomId + " | Received Action: " + message.getAction() + 
                           " from " + message.getSenderId() + " at timestamp: " + message.getTimestamp());
        
        // The return value is automatically broadcasted to all subscribers of @SendTo destination
        return message;
    }
}
