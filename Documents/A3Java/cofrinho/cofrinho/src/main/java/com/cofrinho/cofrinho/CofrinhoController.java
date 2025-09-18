package com.cofrinho.cofrinho;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/cofrinho")
public class CofrinhoController {

    @Autowired
    private CofrinhoService service;

    @GetMapping
    public String home() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam String nome, Model model, HttpSession session) {
        List<Usuario> usuarios = service.buscarUsuariosPorNome(nome);
        if (usuarios.isEmpty()) {
            Usuario novoUsuario = service.criarNovoUsuario(nome);
            session.setAttribute("usuario", novoUsuario);
        } else if (usuarios.size() == 1) {
            session.setAttribute("usuario", usuarios.get(0));
        } else {
            model.addAttribute("usuarios", usuarios);
            return "select-user";
        }
        return "redirect:/cofrinho/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return "redirect:/cofrinho/login";
        }
        List<MetaFinanceira> metas = service.listarMetasDoUsuario(usuario.getId());
        model.addAttribute("usuario", usuario);
        model.addAttribute("metas", metas);
        return "dashboard";
    }

    @PostMapping("/meta/nova")
    public String criarMeta(HttpSession session,
                          @RequestParam String descricao,
                          @RequestParam double valorMeta,
                          @RequestParam(required = false) Double depositoInicial) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return "redirect:/cofrinho/login";
        }
        
        MetaFinanceira meta = service.criarMeta(usuario.getId(), descricao, valorMeta);
        
        if (depositoInicial != null && depositoInicial > 0) {
            service.depositar(meta.getId(), depositoInicial);
        }
        
        return "redirect:/cofrinho/dashboard";
    }

    @PostMapping("/meta/{id}/depositar")
    @ResponseBody
    public Map<String, Object> depositar(@PathVariable Long id, @RequestParam double valor) {
        service.depositar(id, valor);
        MetaFinanceira meta = service.buscarMeta(id);
        Map<String, Object> response = new HashMap<>();
        response.put("concluida", meta.isConcluida());
        return response;
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/cofrinho";
    }
} 