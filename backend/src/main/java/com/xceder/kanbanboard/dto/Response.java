package com.xceder.kanbanboard.dto;

public class Response {
    private final ERROR error;

    public Response(ERROR error) {
        this.error = error;
    }

    public int getError()
    {
        return error.code;
    }

    public String getMessage()
    {
        return error.name();
    }
}
