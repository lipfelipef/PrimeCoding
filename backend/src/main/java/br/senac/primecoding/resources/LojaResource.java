package br.senac.primecoding.resources;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Dados da loja que mudam por ambiente; o número fica no .env, fora do repositório
@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/loja")
public class LojaResource {

    @Value("${primecoding.loja.whatsapp}")
    private String whatsapp;

    @GetMapping
    public ResponseEntity<Map<String, String>> dados() {
        return ResponseEntity.ok().body(Map.of("whatsapp", whatsapp));
    }
}
