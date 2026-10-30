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
}
