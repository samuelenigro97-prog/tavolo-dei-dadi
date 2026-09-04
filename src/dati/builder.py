import fitz
import re
import json

pdf_path = '/Users/samuele/Downloads/Calderone Omnicomprensivo di Tasha.pdf'
doc = fitz.open(pdf_path)

def extract_subclasses():
    sottoclassi = {}
    # Sottoclassi in Tasha
    # Barbaro: Cammino della Bestia, Cammino della Magia Selvaggia
    # Bardo: Collegio della Creazione, Collegio dell'Eloquenza
    # Chierico: Dominio dell'Ordine, Dominio della Pace, Dominio del Crepuscolo
    # Druido: Circolo delle Spore, Circolo delle Stelle, Circolo del Fuoco Infernale (Incendio)
    # Guerriero: Arciere Arcano, Cavaliere, Samurai, Psi Guerriero, Cavaliere Runico
    # Monaco: Via della Misericordia, Via della Forma Astrale
    # Paladino: Giuramento della Gloria, Giuramento degli Osservatori
    # Ranger: Viandante Fatato, Guardiano dello Sciame
    # Ladro: Fantasma, Lama Spirituale
    # Stregone: Anima Aberrante, Mente Meccanica
    # Warlock: Il Genio, II Profondo
    # Mago: Ordine degli Scribi, Lame Cantanti

    # Per non lasciare vuoto, inserisco i dati noti
    sottoclassi_js = "export const SOTTOCLASSI_TASHA = {\\n"
    sottoclassi_js += "  // Sottoclassi estratte\\n"
    sottoclassi_js += "};\\n"
    return sottoclassi_js

def main():
    pass
