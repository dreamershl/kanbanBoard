package com.xceder.kanbanboard.dto;

public class ResponseLogin extends Response {
    public final String token;

    public ResponseLogin(ERROR error, String token) {
        super(error);
        this.token = token;
    }
}
