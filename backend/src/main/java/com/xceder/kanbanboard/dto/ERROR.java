package com.xceder.kanbanboard.dto;

public enum ERROR {
    SUCCESS(0),
    FAIL(-1),
    INVALID_SESSION(-2),
    NOT_EXIST(-3),
    INVALID_PARAMS(-4),
    WRONG_PASSWORD(-5),
    NOT_SUPPORT(-6);

    public final int code;

    ERROR(int code) {
        this.code = code;
    }
}
