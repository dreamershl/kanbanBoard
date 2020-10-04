package com.xceder.kanbanboard.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalNotification;
import com.xceder.kanbanboard.dto.ERROR;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AccountStore {
    private final Cache<String, Pair<String, String>> cache = buildCache();
    private final ConcurrentHashMap<String, String> sessionAccountMap = new ConcurrentHashMap<>();
    private final PasswordEncryptor passwordEncryptor;

    @Autowired
    public AccountStore(PasswordEncryptor passwordEncryptor) {
        this.passwordEncryptor = passwordEncryptor;

        cache.put("test", Pair.of("05a671c66aefea124cc08b76ea6d30bb", ""));
    }

    private Cache<String, Pair<String, String>> buildCache() {
        return CacheBuilder.newBuilder().removalListener(this::onRemoveCache).build();
    }

    private void onRemoveCache(RemovalNotification<String, Pair<String, String>> notification) {
        String session = notification.getValue().getRight();

        sessionAccountMap.remove(session);
    }

    public ERROR login(String account, String password) {
        ERROR error = ERROR.SUCCESS;

        if (!account.isEmpty() && !password.isEmpty()) {
            String pwd = passwordEncryptor.decrypt(password);
            Pair<String, String> pair = cache.getIfPresent(account);

            if (pair != null) {
                if (!pwd.endsWith(pair.getLeft())) {
                    error = ERROR.WRONG_PASSWORD;
                } else {
                    String session = UUID.randomUUID().toString();
                    sessionAccountMap.remove(pair.getRight());
                    cache.put(account, Pair.of(pwd, session));
                    sessionAccountMap.put(session, account);
                }
            } else
                error = ERROR.NOT_EXIST;
        } else
            error = ERROR.INVALID_PARAMS;

        return error;
    }

    public String getAccount(String session) {
        return sessionAccountMap.getOrDefault(session, "");
    }
}


