package br.senac.primecoding.resources;

import br.senac.primecoding.entities.Modelo;
import br.senac.primecoding.services.ModeloService;
import br.senac.primecoding.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/modelos")
public class ModeloResource {

    @Autowired
    private ModeloService modeloService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Modelo>> findAtivos() {
        return ResponseEntity.ok().body(modeloService.findAtivos());
    }

    @GetMapping(value = "/linha/{linha}")
    public ResponseEntity<Modelo> findByLinha(@PathVariable String linha) {
        return ResponseEntity.ok().body(modeloService.findByLinha(linha));
    }

    @GetMapping(value = "/todos")
    public ResponseEntity<List<Modelo>> findAll(@RequestHeader(value = "Authorization", required = false) String token) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.findAll());
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Modelo> findById(@RequestHeader(value = "Authorization", required = false) String token,
                                           @PathVariable Integer id) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.findById(id));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Modelo> atualizar(@RequestHeader(value = "Authorization", required = false) String token,
                                            @PathVariable Integer id, @RequestBody Modelo modelo) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.atualizar(id, modelo));
    }
}