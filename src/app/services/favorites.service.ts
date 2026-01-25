import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Favorite {
  artist: string;
  title: string;
  lyrics: string;
  addedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'lyrics_favorites';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$: Observable<Favorite[]> = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const favorites = JSON.parse(saved);
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  private saveFavorites(favorites: Favorite[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  addFavorite(favorite: Favorite): void {
    const favorites = this.favoritesSubject.value;
    
    // Evitar duplicados
    const exists = favorites.some(
      (f: { artist: string; title: string; }) => f.artist.toLowerCase() === favorite.artist.toLowerCase() &&
           f.title.toLowerCase() === favorite.title.toLowerCase()
    );
    
    if (!exists) {
      favorites.push(favorite);
      this.saveFavorites(favorites);
    }
  }

  removeFavorite(artist: string, title: string): void {
    const favorites = this.favoritesSubject.value.filter(
      ( f: { artist: string; title: string; }) => !(f.artist.toLowerCase() === artist.toLowerCase() &&
             f.title.toLowerCase() === title.toLowerCase())
    );
    this.saveFavorites(favorites);
  }

  isFavorite(artist: string, title: string): boolean {
    return this.favoritesSubject.value.some(
      (f: { artist: string; title: string; }) => f.artist.toLowerCase() === artist.toLowerCase() &&
           f.title.toLowerCase() === title.toLowerCase()
    );
  }

  getFavorites(): Favorite[] {
    return this.favoritesSubject.value;
  }

  // Nuevo método para reordenar
  reorderFavorites(fromIndex: number, toIndex: number): void {
    const favorites = [...this.favoritesSubject.value];
    const [movedItem] = favorites.splice(fromIndex, 1);
    favorites.splice(toIndex, 0, movedItem);
    this.saveFavorites(favorites);
  }
}