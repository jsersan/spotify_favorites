import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Favorite } from '../../services/favorites.service';
import { SpotifyService } from '../../services/spotify.service';
import { SpotifyTrack } from '../../models/music.models';

@Component({
  selector: 'app-playlist-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-player.component.html',
  styleUrls: ['./playlist-player.component.css']
})
export class PlaylistPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() favorites: Favorite[] = [];

  currentIndex = 0;
  currentFavorite: Favorite | null = null;
  currentSpotifyTrack: SpotifyTrack | null = null;
  showEmbed = true;

  constructor(
    private spotifyService: SpotifyService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.favorites.length > 0) {
      this.loadTrack(0);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['favorites'] && !changes['favorites'].firstChange) {
      const currentFavs = changes['favorites'].currentValue || [];
      
      if (currentFavs.length === 0) {
        this.currentFavorite = null;
        this.currentSpotifyTrack = null;
      } else if (this.currentIndex >= currentFavs.length) {
        this.loadTrack(0);
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  loadTrack(index: number): void {
    if (index < 0 || index >= this.favorites.length) return;
    
    // Ocultar iframe temporalmente
    this.showEmbed = false;
    
    this.currentIndex = index;
    this.currentFavorite = this.favorites[index];
    
    // Cargar información de Spotify
    this.spotifyService.searchTrack(
      this.currentFavorite.artist, 
      this.currentFavorite.title
    ).subscribe({
      next: (track:any) => {
        this.currentSpotifyTrack = track;
        
        // Mostrar iframe nuevamente
        setTimeout(() => {
          this.showEmbed = true;
        }, 100);
      },
      error: () => {
        console.error('Error loading Spotify track');
        this.currentSpotifyTrack = null;
        this.showEmbed = true;
      }
    });
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.loadTrack(this.currentIndex - 1);
    }
  }

  next(): void {
    if (this.currentIndex < this.favorites.length - 1) {
      this.loadTrack(this.currentIndex + 1);
    }
  }

  selectTrack(index: number): void {
    if (index !== this.currentIndex) {
      this.loadTrack(index);
    }
  }

  getSpotifyEmbedUrl(): SafeResourceUrl {
    if (!this.currentSpotifyTrack) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    const url = `https://open.spotify.com/embed/track/${this.currentSpotifyTrack.id}?utm_source=generator`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openInSpotify(): void {
    if (this.currentSpotifyTrack) {
      window.open(this.currentSpotifyTrack.external_urls.spotify, '_blank');
    }
  }
}