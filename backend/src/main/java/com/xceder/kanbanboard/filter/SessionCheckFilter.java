package com.xceder.kanbanboard.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xceder.kanbanboard.dto.ERROR;
import com.xceder.kanbanboard.dto.Response;
import com.xceder.kanbanboard.service.AccountStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class SessionCheckFilter extends OncePerRequestFilter {
    private final AccountStore accountStore;
    private final Set<String> excludePathSet;

    @Autowired
    public SessionCheckFilter(@Value("${filter.excludePaths}") String[] config, AccountStore accountStore) {
        this.accountStore = accountStore;
        this.excludePathSet = Arrays.stream(config).filter(i -> !i.isEmpty()).collect(Collectors.toSet());
    }

    private boolean isValidRequest(HttpServletRequest request) {
        boolean isValid = request.getMethod().equalsIgnoreCase(HttpMethod.OPTIONS.name());

        if (!isValid) {
            String token = request.getHeader("token");

            if (token == null)
                token = "";

            String account = accountStore.getAccount(token);

            if (!account.isEmpty())
                isValid = true;
        }

        return isValid;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        boolean isValid = isValidRequest(request);

        if (!isValid) {
            if (!excludePathSet.contains(request.getRequestURI())) {
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader("Access-Control-Allow-Methods", "*");
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Allow-Headers", "*");
                response.setStatus(HttpStatus.OK.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                final ObjectMapper mapper = new ObjectMapper();
                mapper.writeValue(response.getWriter(), new Response(ERROR.INVALID_SESSION));
            } else
                isValid = true;
        }

        if (isValid)
            filterChain.doFilter(request, response);
    }
}
