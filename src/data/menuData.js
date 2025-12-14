export const menuData = {
  antipasti: [
    {
      id: 'ant1',
      name: 'Gran tagliere misto salumi e formaggi',
      price: 15.00,
      description: 'Selezione di salumi e formaggi tipici',
      ingredients: 'Salumi misti, formaggi locali',
      allergens: ['Lattosio']
    },
    {
      id: 'ant2',
      name: 'Bagna cauda con verdure',
      price: 7.00,
      description: 'Tradizionale salsa piemontese con verdure fresche',
      ingredients: 'Acciughe, aglio, olio, verdure di stagione',
      allergens: ['Pesce']
    },
    {
      id: 'ant3',
      name: 'Sfogliatine alle verdure',
      price: 4.50,
      description: 'Sfoglie croccanti ripiene di verdure',
      ingredients: 'Pasta sfoglia, verdure miste',
      allergens: ['Glutine']
    },
    {
      id: 'ant4',
      name: 'Cipolle caramellate e formaggio',
      price: 4.50,
      description: 'Cipolle dolci con formaggio fuso',
      ingredients: 'Cipolle, formaggio, zucchero',
      allergens: ['Lattosio']
    }
  ],
  
  primi: [
    {
      id: 'pri1',
      name: 'Agnolotti al sugo di arrosto',
      price: 7.50,
      description: 'Agnolotti ripieni con sugo di carne',
      ingredients: 'Pasta all\'uovo, carne, sugo di arrosto',
      allergens: ['Glutine', 'Uova']
    },
    {
      id: 'pri2',
      name: 'Zuppa rustica di legumi e cereali',
      price: 6.00,
      description: 'Zuppa calda e nutriente',
      ingredients: 'Legumi misti, cereali, verdure',
      allergens: []
    },
    {
      id: 'pri3',
      name: 'Risotto alla zucca e stracchino',
      price: 6.50,
      description: 'Cremoso risotto autunnale',
      ingredients: 'Riso Carnaroli, zucca, stracchino',
      allergens: ['Lattosio']
    }
  ],
  
  secondi: [
    {
      id: 'sec1',
      name: 'Stinchetto di maiale con crauti',
      price: 8.50,
      description: 'Stinco arrosto con crauti tradizionali',
      ingredients: 'Stinchetto di maiale, crauti',
      allergens: []
    },
    {
      id: 'sec2',
      name: 'Merluzzo panna e cipolla',
      price: 5.00,
      description: 'Filetto di merluzzo in cremosa salsa',
      ingredients: 'Merluzzo, panna, cipolla',
      allergens: ['Pesce', 'Lattosio']
    },
    {
      id: 'sec3',
      name: 'Nuggets per bambini',
      price: 4.00,
      description: 'Bocconcini di pollo croccanti',
      ingredients: 'Petto di pollo, panatura',
      allergens: ['Glutine']
    }
  ],
  
  contorni: [
    {
      id: 'con1',
      name: 'Patatine fritte',
      price: 4.50,
      description: 'Patatine dorate e croccanti',
      ingredients: 'Patate, olio',
      allergens: []
    }
  ],
  
  panini: [
    {
      id: 'pan1',
      name: 'Panino prosciutto',
      price: 4.00,
      description: 'Panino con prosciutto cotto',
      ingredients: 'Pane, prosciutto cotto',
      allergens: ['Glutine']
    },
    {
      id: 'pan2',
      name: 'Panino al salame',
      price: 4.00,
      description: 'Panino con salame tipico',
      ingredients: 'Pane, salame',
      allergens: ['Glutine']
    },
    {
      id: 'pan3',
      name: 'Panino alle acciughe',
      price: 5.50,
      description: 'Panino con acciughe sott\'olio',
      ingredients: 'Pane, acciughe',
      allergens: ['Glutine', 'Pesce']
    },
    {
      id: 'pan4',
      name: 'Panino alla porchetta',
      price: 6.00,
      description: 'Panino con porchetta artigianale',
      ingredients: 'Pane, porchetta',
      allergens: ['Glutine']
    },
    {
      id: 'pan5',
      name: 'Aggiunta formaggio',
      price: 1.00,
      description: 'Formaggio aggiuntivo per il panino',
      ingredients: 'Formaggio',
      allergens: ['Lattosio']
    }
  ],
  
  streetfood: [
    {
      id: 'sf1',
      name: 'Patatine fritte',
      price: 3.50,
      description: 'Porzione di patatine croccanti',
      ingredients: 'Patate, olio, sale',
      allergens: []
    },
    {
      id: 'sf2',
      name: 'Arancini di riso',
      price: 3.50,
      description: 'Arancini siciliani ripieni',
      ingredients: 'Riso, ragù, mozzarella, panatura',
      allergens: ['Glutine', 'Lattosio']
    },
    {
      id: 'sf3',
      name: 'Nuggets di pollo',
      price: 4.00,
      description: 'Bocconcini di pollo impanati',
      ingredients: 'Pollo, panatura',
      allergens: ['Glutine']
    },
    {
      id: 'sf4',
      name: 'Frittella dolce/salata',
      price: 3.00,
      description: 'Frittella a scelta dolce o salata',
      ingredients: 'Farina, lievito (varia a seconda della versione)',
      allergens: ['Glutine']
    }
  ],
  
  dolci: [
    {
      id: 'dol1',
      name: 'Strudel alle mele',
      price: 5.00,
      description: 'Classico strudel di mele caldo',
      ingredients: 'Mele, pasta sfoglia, uvetta, cannella',
      allergens: ['Glutine']
    },
    {
      id: 'dol2',
      name: 'Tortino caldo al cioccolato',
      price: 5.00,
      description: 'Tortino con cuore di cioccolato fondente',
      ingredients: 'Cioccolato fondente, burro, uova, farina',
      allergens: ['Glutine', 'Uova', 'Lattosio']
    }
  ],
  
  golosoni: [
    {
      id: 'gol1',
      name: 'Strudel di mele',
      price: 5.00,
      description: 'Dolce strudel con mele e cannella',
      ingredients: 'Mele, pasta sfoglia, uvetta, cannella',
      allergens: ['Glutine']
    },
    {
      id: 'gol2',
      name: 'Tortino caldo al cioccolato',
      price: 5.00,
      description: 'Tortino fondente al cioccolato',
      ingredients: 'Cioccolato fondente, burro, uova, farina',
      allergens: ['Glutine', 'Uova', 'Lattosio']
    },
    {
      id: 'gol3',
      name: 'Cioccolata calda',
      price: 3.00,
      description: 'Cioccolata calda densa e cremosa',
      ingredients: 'Cioccolato, latte, zucchero',
      allergens: ['Lattosio']
    },
    {
      id: 'gol4',
      name: 'Vin brulè',
      price: 3.00,
      description: 'Vino caldo speziato',
      ingredients: 'Vino rosso, spezie, zucchero',
      allergens: ['Solfiti']
    }
  ],
  
  bevande: [
    {
      id: 'bev1',
      name: 'Bicchiere di rosso/bianco alla spina',
      price: 2.50,
      description: 'Vino rosso o bianco al bicchiere',
      ingredients: 'Vino',
      allergens: ['Solfiti']
    },
    {
      id: 'bev2',
      name: 'Birra bionda/rossa alla spina',
      price: 4.50,
      description: 'Birra artigianale alla spina media',
      ingredients: 'Malto d\'orzo, luppolo, acqua',
      allergens: ['Glutine']
    },
    {
      id: 'bev3',
      name: 'Birra aromatizzata al Torcetto ESCLUSIVA',
      price: 3.50,
      description: 'Birra speciale aromatizzata',
      ingredients: 'Birra, aromi naturali',
      allergens: ['Glutine']
    },
    {
      id: 'bev4',
      name: 'Bottiglietta acqua 1/2 litro',
      price: 1.00,
      description: 'Acqua minerale naturale',
      ingredients: 'Acqua minerale',
      allergens: []
    },
    {
      id: 'bev5',
      name: '1 litro di vino bianco/rosso in caraffa',
      price: 8.00,
      description: 'Caraffa di vino della casa',
      ingredients: 'Vino',
      allergens: ['Solfiti']
    },
    {
      id: 'bev6',
      name: 'Bibite in lattina',
      price: 2.50,
      description: 'Bevande analcoliche varie',
      ingredients: 'Acqua, zucchero, aromi',
      allergens: []
    },
    {
      id: 'bev7',
      name: 'Spritz',
      price: 5.00,
      description: 'Aperitivo Spritz classico',
      ingredients: 'Prosecco, Aperol, seltz',
      allergens: ['Solfiti']
    },
    {
      id: 'bev8',
      name: 'Amari',
      price: 3.00,
      description: 'Amaro digestivo',
      ingredients: 'Alcool, erbe',
      allergens: []
    },
    {
      id: 'bev9',
      name: 'Gin Tonic / Gin Lemon',
      price: 5.00,
      description: 'Gin con tonica o lemon',
      ingredients: 'Gin, tonica/lemon',
      allergens: []
    },
    {
      id: 'bev10',
      name: 'Shottino al passito',
      price: 3.00,
      description: 'Shot di vino passito',
      ingredients: 'Vino passito',
      allergens: ['Solfiti']
    },
    {
      id: 'bev11',
      name: 'Limoncello',
      price: 3.00,
      description: 'Liquore di limone',
      ingredients: 'Alcool, limoni, zucchero',
      allergens: []
    },
    {
      id: 'bev12',
      name: 'Tisane',
      price: 1.50,
      description: 'Tisane calde varie',
      ingredients: 'Erbe naturali',
      allergens: []
    },
    {
      id: 'bev13',
      name: 'Caffè',
      price: 1.00,
      description: 'Caffè espresso',
      ingredients: 'Caffè',
      allergens: []
    },
    {
      id: 'bev14',
      name: 'Caffè corretto',
      price: 2.00,
      description: 'Caffè con liquore',
      ingredients: 'Caffè, liquore',
      allergens: []
    }
  ]
}
