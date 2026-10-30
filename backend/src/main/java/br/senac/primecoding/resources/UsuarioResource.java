package br.senac.primecoding.resources;

import br.senac.primecoding.entities.Usuario;
import br.senac.primecoding.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/usuarios")
public class UsuarioResource {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping(value = "/login")
    public ResponseEntity<Usuario> login(@RequestBody Usuario usuario) {
        return ResponseEntity.ok().body(usuarioService.login(usuario));
    }

    @PostMapping(value = "/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        usuarioService.logout(token);
        return ResponseEntity.noContent().build();
    }

    // O painel usa para saber se o token guardado ainda vale
    @GetMapping(value = "/eu")
    public ResponseEntity<Usuario> eu(@RequestHeader(value = "Authorization", required = false) String token) {
        return ResponseEntity.ok().body(usuarioService.exigirLogin(token));
    }
}