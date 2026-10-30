package br.senac.primecoding.services;

import br.senac.primecoding.entities.*;
import br.senac.primecoding.repositories.KitSetupRepository;
import br.senac.primecoding.repositories.ModeloRepository;
import br.senac.primecoding.repositories.UnidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

// Mesmos dados do script do banco, gravados só quando o banco está vazio
@Service
public class DBService {

    @Autowired
    private ModeloRepository modeloRepository;

    @Autowired
    private KitSetupRepository kitSetupRepository;

    @Autowired
    private UnidadeRepository unidadeRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Value("${primecoding.admin.email}")
    private String adminEmail;

    @Value("${primecoding.admin.senha}")
    private String adminSenha;

    public void instanciarDB() {
        if (!usuarioService.existeAlgum()) {
            usuarioService.criar("Revendedor", adminEmail, adminSenha);
        }
        if (modeloRepository.count() > 0) {
            return;
        }

        Modelo entrada = new Modelo("ENTRADA", "ThinkPad T14 Gen 2", "Lenovo",
                "Para quem está começando a faculdade de TI: robusto, com teclado ótimo e memória que dá para ampliar.",
                2899.00);
        especificar(entrada, "Processador", "Intel Core i5-1145G7, 4 núcleos, até 4,4 GHz");
        especificar(entrada, "Memória", "16 GB DDR4 (ampliável para 32 GB)");
        especificar(entrada, "Armazenamento", "SSD NVMe de 512 GB");
        especificar(entrada, "Tela", "14 polegadas, Full HD (1920 x 1080), IPS");
        especificar(entrada, "Portas", "2 USB-C (1 Thunderbolt 4), 2 USB-A, HDMI, rede RJ45 e fone");
        especificar(entrada, "Sistema", "Windows 11 Pro");
        especificar(entrada, "Teclado", "ABNT2 (português do Brasil)");
        entrada.getUpgrades().add(new Upgrade(entrada, "Memória para 32 GB", 450.00, 1));
        entrada.getUpgrades().add(new Upgrade(entrada, "SSD de 1 TB", 350.00, 1));

        Modelo intermediario = new Modelo("INTERMEDIARIO", "Latitude 5430", "Dell",
                "Para estágio e back-end: 32 GB para Docker, máquinas virtuais e IDE abertos ao mesmo tempo.",
                4999.00);
        especificar(intermediario, "Processador", "Intel Core i7-1265U, 10 núcleos, até 4,8 GHz");
        especificar(intermediario, "Memória", "32 GB DDR4");
        especificar(intermediario, "Armazenamento", "SSD NVMe de 1 TB");
        especificar(intermediario, "Tela", "14 polegadas, Full HD (1920 x 1080)");
        especificar(intermediario, "Portas", "2 USB-C Thunderbolt 4, 2 USB-A, HDMI, rede RJ45, leitor microSD e fone");
        especificar(intermediario, "Sistema", "Windows 11 Pro");
        especificar(intermediario, "Teclado", "ABNT2 (português do Brasil)");
        intermediario.getUpgrades().add(new Upgrade(intermediario, "SSD de 2 TB", 650.00, 1));

        Modelo pro = new Modelo("PRO", "MacBook Air 13 (M2)", "Apple",
                "Para quem quer bateria para o dia todo, silêncio total e desenvolvimento para iPhone com Xcode.",
                6999.00);
        especificar(pro, "Chip", "Apple M2, CPU de 8 núcleos");
        especificar(pro, "Memória", "16 GB unificada");
        especificar(pro, "Armazenamento", "SSD de 512 GB");
        especificar(pro, "Tela", "Liquid Retina de 13,6 polegadas");
        especificar(pro, "Portas", "2 Thunderbolt / USB 4, MagSafe 3 e fone");
        especificar(pro, "Sistema", "macOS");
        especificar(pro, "Teclado", "ABNT2 (português do Brasil)");

        modeloRepository.save(entrada);
        modeloRepository.save(intermediario);
        modeloRepository.save(pro);

        kitSetupRepository.save(new KitSetup("Estudante", "O básico para a faculdade",
                "Git, VS Code, Java (JDK 21), Python e navegadores"));
        kitSetupRepository.save(new KitSetup("Back-end", "APIs, bancos e containers",
                "Git, Docker, WSL (no Windows), Java (JDK 21), Node.js, Postman e MySQL"));
        kitSetupRepository.save(new KitSetup("Front-end", "Sites e aplicações web",
                "Git, VS Code, Node.js, extensões de front-end e navegadores de teste"));
        kitSetupRepository.save(new KitSetup("Dados", "Análise e ciência de dados",
                "Git, Python, Jupyter, pandas e VS Code"));
        kitSetupRepository.save(new KitSetup("Mobile", "Apps Android e iPhone",
                "Git, Android Studio, Flutter e, no MacBook, Xcode"));

        // Estado B custa R$ 200 a menos (RN04)
        unidade(entrada, "SN-ENT-0001", "A", 92, 210, 2899.00, "DISPONIVEL", "2026-10-20");
        unidade(entrada, "SN-ENT-0002", "A", 88, 340, 2899.00, "DISPONIVEL", "2026-10-20");
        unidade(entrada, "SN-ENT-0003", "B", 85, 410, 2699.00, "DISPONIVEL", "2026-10-22");
        unidade(intermediario, "SN-INT-0001", "A", 95, 120, 4999.00, "DISPONIVEL", "2026-10-21");
        unidade(intermediario, "SN-INT-0002", "B", 90, 260, 4799.00, "DISPONIVEL", "2026-10-23");
        unidade(pro, "SN-PRO-0001", "A", 96, 85, 6999.00, "DISPONIVEL", "2026-10-24");
        unidade(pro, "SN-PRO-0002", "A", 91, 150, 6999.00, "EM_REVISAO", "2026-10-27");
    }

    private void especificar(Modelo modelo, String nome, String valor) {
        int ordem = modelo.getEspecificacoes().size() + 1;
        modelo.getEspecificacoes().add(new Especificacao(modelo, nome, valor, ordem));
    }

    private void unidade(Modelo modelo, String serie, String estado, int bateria, int ciclos, double preco,
                         String situacao, String data) {
        unidadeRepository.save(new Unidade(modelo, serie, estado, bateria, ciclos, preco, situacao,
                LocalDate.parse(data)));
    }
}
