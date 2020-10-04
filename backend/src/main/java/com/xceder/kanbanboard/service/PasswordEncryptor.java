package com.xceder.kanbanboard.service;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class PasswordEncryptor {
    private final PrivateKey privateKey;
    private transient Cipher cipher;

    public PasswordEncryptor()
            throws NoSuchAlgorithmException, IOException, InvalidKeySpecException, NoSuchPaddingException,
            InvalidKeyException {
        privateKey = loadRSAKey();
        getCipher();
    }

    private PrivateKey loadRSAKey()
            throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        InputStream stream = getPrivateKey();
        String keyText = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
        keyText =
                keyText
                        .replace("-----BEGIN PRIVATE KEY-----", "")
                        .replace("-----END PRIVATE KEY-----", "")
                        .replace("\n", "");
        byte[] keyBytes = Base64.getDecoder().decode(keyText);
        // generate private key
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(spec);
    }

    private InputStream getPrivateKey() {
        ClassLoader loader = getClass().getClassLoader();
        String RSA_KEY = "unitTest.pcks8";
        return loader.getResourceAsStream(RSA_KEY);
    }

    private Cipher getCipher()
            throws InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException {
        if (cipher == null) {
            cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
            // decrypt the text using the private key
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
        }
        return cipher;
    }

    public String decrypt(String strPWD) throws IllegalArgumentException {
        String token = "";
        try {
            byte[] code = Base64.getDecoder().decode(strPWD);
            code = getCipher().doFinal(code);
            token = new String(code, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            LoggerFactory.getLogger(getClass()).error("can't decrypt password " + strPWD, ex);
            cipher = null;
        }
        return token;
    }
}
