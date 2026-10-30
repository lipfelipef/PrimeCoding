package br.senac.primecoding.util;

public class Documentos {

    // Deixa só os dígitos: "(11) 98765-4321" vira "11987654321"
    public static String somenteNumeros(String valor) {
        if (valor == null) {
            return "";
        }
        String resultado = "";
        for (int i = 0; i < valor.length(); i++) {
            char c = valor.charAt(i);
            if (c >= '0' && c <= '9') {
                resultado = resultado + c;
            }
        }
        return resultado;
    }

    private static boolean todosIguais(String valor) {
        for (int i = 1; i < valor.length(); i++) {
            if (valor.charAt(i) != valor.charAt(0)) {
                return false;
            }
        }
        return true;
    }

    public static boolean cpfValido(String cpf) {
        if (cpf == null || cpf.length() != 11 || todosIguais(cpf)) {
            return false;
        }
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += (cpf.charAt(i) - '0') * (10 - i);
        }
        int dv1 = (soma * 10) % 11;
        if (dv1 == 10) {
            dv1 = 0;
        }
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += (cpf.charAt(i) - '0') * (11 - i);
        }
        int dv2 = (soma * 10) % 11;
        if (dv2 == 10) {
            dv2 = 0;
        }
        return dv1 == cpf.charAt(9) - '0' && dv2 == cpf.charAt(10) - '0';
    }
}
