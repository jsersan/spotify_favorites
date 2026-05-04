import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'eu';

export interface Translations {
  [key: string]: {
    es: string;
    eu: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app_language';
  private currentLanguageSubject: BehaviorSubject<Language>;
  public currentLanguage$: Observable<Language>;

  private translations: Translations = {
    // Header
    'header.title': {
      es: 'Letras y Música - Txema Serrano',
      eu: 'Letrak eta Musika - Txema Serrano'
    },
    'header.spotifyLink': {
      es: 'Ir a Spotify',
      eu: 'Spotify-ra joan'
    },

    // Search form
    'search.title': {
      es: 'Buscar Canción',
      eu: 'Abestia Bilatu'
    },
    'search.artist': {
      es: 'Artista',
      eu: 'Artista'
    },
    'search.artistPlaceholder': {
      es: 'Ejemplo: The Beatles',
      eu: 'Adibidea: The Beatles'
    },
    'search.song': {
      es: 'Canción',
      eu: 'Abestia'
    },
    'search.songPlaceholder': {
      es: 'Ejemplo: Help',
      eu: 'Adibidea: Help'
    },
    'search.searching': {
      es: 'Buscando...',
      eu: 'Bilatzen...'
    },
    'search.searchButton': {
      es: 'Buscar',
      eu: 'Bilatu'
    },
    'search.clearButton': {
      es: 'Limpiar',
      eu: 'Garbitu'
    },

    // Loading & Errors
    'loading.message': {
      es: 'Buscando...',
      eu: 'Bilatzen...'
    },
    'error.noData': {
      es: 'No se encontró información',
      eu: 'Ez da informaziorik aurkitu'
    },
    'error.searchError': {
      es: 'Error en la búsqueda',
      eu: 'Errorea bilaketan'
    },
    'error.required': {
      es: 'Ingresa artista y canción',
      eu: 'Sartu artista eta abestia'
    },

    // Favorites
    'favorites.title': {
      es: '⭐ Mis Favoritas',
      eu: '⭐ Nire Gogokoenak'
    },
    'favorites.dragHint': {
      es: '💡 Arrastra las canciones para reordenarlas',
      eu: '💡 Arrastatu abestiak ordenatzeko'
    },
    'favorites.delete': {
      es: 'Eliminar',
      eu: 'Ezabatu'
    },
    'favorites.addToFavorites': {
      es: 'Añadir a favoritos',
      eu: 'Gogokoetara gehitu'
    },
    'favorites.removeFromFavorites': {
      es: 'Quitar de favoritos',
      eu: 'Gogokoetatik kendu'
    },

    // Delete modal
    'modal.deleteTitle': {
      es: 'Eliminar de favoritos',
      eu: 'Gogokoetatik ezabatu'
    },
    'modal.deleteMessage': {
      es: '¿Estás seguro de que quieres eliminar esta canción de tus favoritos?',
      eu: 'Ziur zaude abesti hau zure gogokoetatik ezabatu nahi duzula?'
    },
    'modal.cancel': {
      es: 'Cancelar',
      eu: 'Utzi'
    },
    'modal.confirm': {
      es: 'Eliminar',
      eu: 'Ezabatu'
    },

    // Lyrics
    'lyrics.title': {
      es: '📝',
      eu: '📝'
    },

    // Player
    'player.title': {
      es: '🎵 Reproductor de Favoritos',
      eu: '🎵 Gogokoen Erreproduzigailua'
    },
    'player.preview': {
      es: 'Preview (30 seg):',
      eu: 'Aurrebista (30 seg):'
    },
    'player.openSpotify': {
      es: '🎵 Abrir en Spotify',
      eu: '🎵 Spotify-n ireki'
    },
    'player.infoTitle': {
      es: 'Cómo usar:',
      eu: 'Nola erabili:'
    },
    'player.infoText': {
      es: 'Las políticas de seguridad del navegador impiden ejecutar el autoplay. Usa los controles del reproductor de Spotify (arriba) para reproducir las canciones. Los botones ⏮️ ⏭️ te permiten navegar entre tus favoritos. Para escuchar la canción completa, haz clic en "Abrir en Spotify" 👇',
      eu: 'Nabigatzailearen segurtasun politikek autoplay exekutatzea eragozten dute. Erabili Spotify-ren erreproduzigailuaren kontrolak (goian) abestiak erreproduzitzeko. ⏮️ ⏭️ botoiek zure gogokoen artean nabigatzea ahalbidetzen dute. Abesti osoa entzuteko, egin klik "Spotify-n ireki" 👇'
    },
    'player.previous': {
      es: 'Canción anterior',
      eu: 'Aurreko abestia'
    },
    'player.next': {
      es: 'Siguiente canción',
      eu: 'Hurrengo abestia'
    },
    'player.noSong': {
      es: 'Sin canción',
      eu: 'Abestirik gabe'
    },
    'player.playlist': {
      es: 'Lista de reproducción',
      eu: 'Erreprodukzio zerrenda'
    },

    // Language selector
    'language.spanish': {
      es: 'Español',
      eu: 'Gaztelania'
    },
    'language.basque': {
      es: 'Euskera',
      eu: 'Euskara'
    }
  };

  constructor() {
    const savedLang = this.getSavedLanguage();
    this.currentLanguageSubject = new BehaviorSubject<Language>(savedLang);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();
  }

  private getSavedLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'es' || saved === 'eu') {
        return saved;
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
    return 'es'; // Default to Spanish
  }

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
      this.currentLanguageSubject.next(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    const translation = this.translations[key];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    return translation[currentLang] || translation.es || key;
  }

  // Método auxiliar para usar en templates con pipe
  instant(key: string): string {
    return this.translate(key);
  }
}