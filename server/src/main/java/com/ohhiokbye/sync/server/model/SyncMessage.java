package com.ohhiokbye.sync.server.model;

public class SyncMessage {
    private String roomId;
    private String action; // "PLAY", "PAUSE", "SEEK", "CHANGE_SONG"
    private double timestamp;
    private String senderId; // To avoid self-echoes
    private String senderTabId; // Unique tab session ID

    private String videoId;
    private String title;
    private String artist;

    // Constructors, Getters, and Setters
    public SyncMessage() {}

    public SyncMessage(String roomId, String action, double timestamp, String senderId, String videoId, String title, String artist) {
        this.roomId = roomId;
        this.action = action;
        this.timestamp = timestamp;
        this.senderId = senderId;
        this.videoId = videoId;
        this.title = title;
        this.artist = artist;
    }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public double getTimestamp() { return timestamp; }
    public void setTimestamp(double timestamp) { this.timestamp = timestamp; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderTabId() { return senderTabId; }
    public void setSenderTabId(String senderTabId) { this.senderTabId = senderTabId; }

    public String getVideoId() { return videoId; }
    public void setVideoId(String videoId) { this.videoId = videoId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
}
