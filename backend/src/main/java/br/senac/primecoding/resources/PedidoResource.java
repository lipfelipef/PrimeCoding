package br.senac.primecoding.resources;

import br.senac.primecoding.entities.HistoricoStatus;
import br.senac.primecoding.entities.Pedido;
import br.senac.primecoding.entities.Usuario;
import br.senac.primecoding.services.PedidoService;
import br.senac.primecoding.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/pedidos")
public class PedidoResource {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private UsuarioService usuarioService;

    // Público: o cliente faz o pedido pelo site, sem login
    @PostMapping
    public ResponseEntity<Pedido> gravar(@RequestBody Pedido pedido) {
        pedido = pedidoService.gravar(pedido);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(pedido.getId()).toUri();
        return ResponseEntity.created(uri).body(pedido);
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> findAll(@RequestHeader(value = "Authorization", required = false) String token) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(pedidoService.findAll());
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Pedido> findById(@RequestHeader(value = "Authorization", required = false) String token,
                                           @PathVariable Integer id) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(pedidoService.findById(id));
    }

    @PutMapping(value = "/{id}/status")
    public ResponseEntity<Pedido> mudarStatus(@RequestHeader(value = "Authorization", required = false) String token,
                                              @PathVariable Integer id, @RequestBody HistoricoStatus dados) {
        Usuario usuario = usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(pedidoService.mudarStatus(id, dados.getStatus(), dados.getObservacao(), usuario));
    }
}