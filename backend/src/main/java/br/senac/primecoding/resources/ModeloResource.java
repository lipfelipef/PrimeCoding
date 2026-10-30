package br.senac.primecoding.resources;

import br.senac.primecoding.entities.FotoModelo;
import br.senac.primecoding.entities.Modelo;
import br.senac.primecoding.services.ModeloService;
import br.senac.primecoding.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
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

    // Público: é a foto que aparece na vitrine. O endereço leva ?v=versão, então pode ficar em cache
    @GetMapping(value = "/{id}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable Integer id) {
        FotoModelo foto = modeloService.foto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.getTipo()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic())
                .body(foto.getDados());
    }

    @PostMapping(value = "/{id}/foto")
    public ResponseEntity<Modelo> gravarFoto(@RequestHeader(value = "Authorization", required = false) String token,
                                             @PathVariable Integer id, @RequestParam("foto") MultipartFile foto) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.gravarFoto(id, foto));
    }

    @DeleteMapping(value = "/{id}/foto")
    public ResponseEntity<Modelo> apagarFoto(@RequestHeader(value = "Authorization", required = false) String token,
                                             @PathVariable Integer id) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.apagarFoto(id));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Modelo> atualizar(@RequestHeader(value = "Authorization", required = false) String token,
                                            @PathVariable Integer id, @RequestBody Modelo modelo) {
        usuarioService.exigirLogin(token);
        return ResponseEntity.ok().body(modeloService.atualizar(id, modelo));
    }
}