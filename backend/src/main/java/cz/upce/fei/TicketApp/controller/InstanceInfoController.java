package cz.upce.fei.TicketApp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

@RestController
public class InstanceInfoController {

    @GetMapping("/api/instance")
    public Map<String, String> getInstanceInfo() throws UnknownHostException {
        String hostname = InetAddress.getLocalHost().getHostName();
        String ipAddress = InetAddress.getLocalHost().getHostAddress();

        Map<String, String> info = new HashMap<>();
        info.put("message", "Request processed by instance:");
        info.put("hostname", hostname);
        info.put("ipAddress", ipAddress);

        return info;
    }
}