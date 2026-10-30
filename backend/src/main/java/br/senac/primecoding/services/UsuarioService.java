package br.senac.primecoding.services;

import br.senac.primecoding.entities.Usuario;
import br.senac.primecoding.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    // Token de cada login aberto -> id do usuário. Some quando o servidor reinicia.
    private final Map<String, Integer> sessoes = new ConcurrentHashMap<>();

    public Usuario login(Usuario dados) {
        String email = "";
        if (dados.getEmail() != null) {
            email = dados.getEmail().trim().toLowerCase();
        }
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null || !usuario.getAtivo() || dados.getSenha() == null
                || !bcrypt.matches(dados.getSenha(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }
        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        String token = UUID.randomUUID().toString();
        sessoes.put(token, usuario.getId());
        usuario.setToken(token);
        return usuario;
    }

    public void logout(String token) {
        if (token != null) {
            sessoes.remove(token);
        }
    }

    // Toda rota do painel chama este método antes de fazer qualquer coisa
    public Usuario exigirLogin(String token) {
        Integer id = null;
        if (token != null) {
            id = sessoes.get(token);
        }
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre no painel para continuar");
        }
        return usuarioRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre no painel para continuar"));
    }

    public Usuario criar(String nome, String email, String senha) {
        return usuarioRepository.save(new Usuario(nome, email.trim().toLowerCase(), bcrypt.encode(senha)));
    }

    public boolean existeAlgum() {
        return usuarioRepository.count() > 0;
    }
}
