import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FavoritesService, Favorite } from './services/favorites.service';
import { LyricsService } from './services/lyrics.service';
import { SpotifyService } from './services/spotify.service';
import { SpotifyTrack } from './models/music.models';

interface LyricsResponse {
  lyrics: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  showDeleteModal = false;
  deleteCandidate: { artist: string; title: string } | null = null;

  private http = inject(HttpClient);
  private lyricsService = inject(LyricsService);
  private spotifyService = inject(SpotifyService);
  private sanitizer = inject(DomSanitizer);
  private favoritesService = inject(FavoritesService);
  private readonly API_URL = 'https://api.lyrics.ovh/v1';
  
  artist = '';
  title = '';
  lyrics = '';
  errorMessage = '';
  isLoading = false;
  searchAttempted = false;
  spotifyTrack: SpotifyTrack | null = null;
  favorites$!: Observable<Favorite[]>;

  ngOnInit(): void {
    this.favorites$ = this.favoritesService.favorites$;
  }

  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');
  }

  private encodeParameter(param: string): string {
    return encodeURIComponent(this.normalizeText(param));
  }

  askDelete(artist: string, title: string): void {
    this.deleteCandidate = { artist, title };
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.deleteCandidate) {
      this.favoritesService.removeFavorite(
        this.deleteCandidate.artist, 
        this.deleteCandidate.title
      );
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteCandidate = null;
  }

  private cleanLyrics(lyrics: string): string {
    if (!lyrics) return '';
    
    return lyrics
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  getLyricsLines(): string[] {
    if (!this.lyrics) return [];
    return this.lyrics.split('\n');
  }

  searchLyrics(): void {
    if (!this.artist.trim() || !this.title.trim()) {
      this.errorMessage = 'Ingresa artista y canción';
      return;
    }

    this.reset();
    this.isLoading = true;
    this.searchAttempted = true;

    forkJoin({
      lyrics: this.lyricsService.searchLyrics(this.artist, this.title),
      spotify: this.spotifyService.searchTrack(this.artist, this.title)
    }).subscribe({
      next: (results) => {
        this.isLoading = false;
        
        if (results.lyrics?.lyrics) {
          this.lyrics = this.cleanLyrics(results.lyrics.lyrics);
        }
        
        if (results.spotify) {
          this.spotifyTrack = results.spotify;
        }
        
        if (!this.lyrics && !this.spotifyTrack) {
          this.errorMessage = 'No se encontró información';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error en la búsqueda';
      }
    });
  }

  clearSearch(): void {
    this.artist = '';
    this.title = '';
    this.reset();
  }

  private reset(): void {
    this.lyrics = '';
    this.errorMessage = '';
    this.spotifyTrack = null;
    this.searchAttempted = false;
  }

  getAlbumImage(): string {
    return this.spotifyTrack?.album.images[0]?.url || 
           'https://via.placeholder.com/100';
  }

  getArtistNames(): string {
    return this.spotifyTrack?.artists.map(a => a.name).join(', ') || '';
  }

  getSpotifyEmbedUrl(): SafeResourceUrl {
    if (!this.spotifyTrack) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    const url = `https://open.spotify.com/embed/track/${this.spotifyTrack.id}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // MÉTODOS DE FAVORITOS
  isFavorite(): boolean {
    if (!this.artist || !this.title) return false;
    return this.favoritesService.isFavorite(this.artist, this.title);
  }

  toggleFavorite(): void {
    if (!this.artist || !this.title || !this.lyrics) return;

    if (this.isFavorite()) {
      this.favoritesService.removeFavorite(this.artist, this.title);
    } else {
      const favorite: Favorite = {
        artist: this.artist,
        title: this.title,
        lyrics: this.lyrics,
        addedAt: new Date().toISOString()
      };
      this.favoritesService.addFavorite(favorite);
    }
  }

  loadFavorite(fav: Favorite): void {
    this.artist = fav.artist;
    this.title = fav.title;
    this.lyrics = fav.lyrics;
    this.errorMessage = '';
    this.searchAttempted = true;
    this.spotifyTrack = null;
    
    // Buscar info de Spotify para esta canción
    this.spotifyService.searchTrack(fav.artist, fav.title).subscribe({
      next: (track) => {
        if (track) {
          this.spotifyTrack = track;
        }
      }
    });
    
    // Scroll suave a las letras
    setTimeout(() => {
      const lyricsBox = document.querySelector('.lyrics-box');
      if (lyricsBox) {
        lyricsBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  removeFavorite(artist: string, title: string): void {
    this.favoritesService.removeFavorite(artist, title);
  }
}