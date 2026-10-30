package br.senac.primecoding.resources;

import br.senac.primecoding.entities.Unidade;
import br.senac.primecoding.services.UnidadeService;
import br.senac.primecoding.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/unidades")
public class UnidadeResource {

    @Autowired
    private UnidadeService unidadeService;

    @Autowired
    private UsuarioService usuarioService;

    // Público: é o que aparece na vitrine
    @GetMapping(value = "/disponiveis")
    public ResponseEntity<List<Unidade>> findDisponiveis() {
        return ResponseEntity.ok().body(unidadeService.findDisponiveis());
    }

    @GetMapping
    public ResponseEntity<List<Unidade>> findAll(@RequestHeader(value = "Authorization", required = false) String token) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(unidadeService.findAll());
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Unidade> findById(@RequestHeader(value = "Authorization", required = false) String token,
                                            @PathVariable Integer id) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(unidadeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Unidade> gravar(@RequestHeader(value = "Authorization", required = false) String token,
                                          @RequestBody Unidade unidade) {
        usuarioService.exigirLogin(token);
        unidade = unidadeService.gravar(unidade);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(unidade.getId()).toUri();
        return ResponseEntity.created(uri).body(unidade);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Unidade> atualizar(@RequestHeader(value = "Authorization", required = false) String token,
                                             @PathVariable Integer id, @RequestBody Unidade unidade) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(unidadeService.atualizar(id, unidade));
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> apagar(@RequestHeader(value = "Authorization", required = false) String token,
                                       @PathVariable Integer id) {
        usuarioService.exigirLogin(token);
        unidadeService.apagar(id);
        return ResponseEntity.noContent().build();
    }
}