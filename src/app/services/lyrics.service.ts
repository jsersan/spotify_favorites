import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LyricsResponse } from '../models/music.models';

@Injectable({
  providedIn: 'root'
})
export class LyricsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.lyrics.ovh/v1';

  searchLyrics(artist: string, title: string): Observable<LyricsResponse> {
    const encodedArtist = encodeURIComponent(this.normalize(artist));
    const encodedTitle = encodeURIComponent(this.normalize(title));
    const url = `${this.API_URL}/${encodedArtist}/${encodedTitle}`;

    return this.http.get<LyricsResponse>(url).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  private normalize(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'No se encontró la canción';
    
    if (error.status === 0) {
      message = 'Error de conexión';
    } else if (error.status === 404) {
      message = 'Canción no encontrada';
    }
    
    return throwError(() => new Error(message));
  }
}
