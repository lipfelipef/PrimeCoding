package br.senac.primecoding.resources;

import br.senac.primecoding.entities.KitSetup;
import br.senac.primecoding.repositories.KitSetupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 33600)
@RestController
@RequestMapping(value = "/kits")
public class KitSetupResource {

    @Autowired
    private KitSetupRepository kitSetupRepository;

    @GetMapping
    public ResponseEntity<List<KitSetup>> findAll() {
        return ResponseEntity.ok().body(kitSetupRepository.findAllByOrderByIdAsc());
    }
}