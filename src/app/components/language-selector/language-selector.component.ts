import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/traslation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl:'./language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})  
  
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  currentLanguage: Language = 'es';

  constructor() {
    this.translationService.currentLanguage$.subscribe((lang: Language) => {
      this.currentLanguage = lang;
    });
  }

  setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }
}