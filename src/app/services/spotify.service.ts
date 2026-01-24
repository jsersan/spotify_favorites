import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { 
  SpotifyAuthResponse, 
  SpotifySearchResponse, 
  SpotifyTrack 
} from '../models/music.models';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private http = inject(HttpClient);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  searchTrack(artist: string, title: string): Observable<SpotifyTrack | null> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const query = encodeURIComponent(`${artist} ${title}`);
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.get<SpotifySearchResponse>(url, { headers });
      }),
      map(response => response.tracks.items[0] || null),
      catchError(() => of(null))
    );
  }

  private getAccessToken(): Observable<string> {
    // Si el token es válido, lo devolvemos
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return of(this.accessToken);
    }

    // Solicitar nuevo token
    const url = 'https://accounts.spotify.com/api/token';
    const body = 'grant_type=client_credentials';
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(
        `${environment.spotifyClientId}:${environment.spotifyClientSecret}`
      )
    });

    return this.http.post<SpotifyAuthResponse>(url, body, { headers }).pipe(
      map(response => {
        this.accessToken = response.access_token;
        this.tokenExpiry = Date.now() + (response.expires_in * 1000);
        return this.accessToken;
      })
    );
  }
}