export type MediaType = "movie" | "tv"
export type ListKind = "imdb" | "top" | "popular"

export type Title = {
  id: string
  title: string
  year: number
  genre: string
  genres: string[]
  rating: number
  synopsis: string
  poster: string | null
  rank: number
  mediaType: MediaType
  director?: string
  runtime?: number
}

export const LIST_META: Record<ListKind, { movieOnly?: boolean }> = {
  imdb: { movieOnly: true },
  top: {},
  popular: {},
}

export const IMDB_TOP_250_LIST_ID = 634

export const DEFAULT_LIST: ListKind = "imdb"

export const ORIGINS = ["ko"] as const
export type Origin = (typeof ORIGINS)[number]

export function isOrigin(v: string | null | undefined): v is Origin {
  return !!v && (ORIGINS as readonly string[]).includes(v)
}

export function listsFor(media: MediaType): ListKind[] {
  return (Object.keys(LIST_META) as ListKind[]).filter(
    (k) => media === "movie" || !LIST_META[k].movieOnly,
  )
}

export type Provider = { id: number; name: string }
export const PROVIDERS: Provider[] = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 1899, name: "Max" },
  { id: 350, name: "Apple TV+" },
  { id: 531, name: "Paramount+" },
  { id: 307, name: "Globoplay" },
  { id: 619, name: "Star+" },
]

function slug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

type Seed = Omit<Title, "id" | "poster" | "rank" | "mediaType" | "genres">

const FALLBACK_MOVIE_TOP: Seed[] = [
  {
    title: "The Shawshank Redemption",
    year: 1994,
    director: "Frank Darabont",
    genre: "Drama",
    runtime: 142,
    rating: 9.3,
    synopsis:
      "Dois homens presos criam um vínculo ao longo dos anos, encontrando conforto e redenção através de atos de decência.",
  },
  {
    title: "The Godfather",
    year: 1972,
    director: "Francis Ford Coppola",
    genre: "Crime",
    runtime: 175,
    rating: 9.2,
    synopsis:
      "O patriarca idoso de uma dinastia do crime organizado transfere o controle de seu império clandestino ao filho relutante.",
  },
  {
    title: "The Dark Knight",
    year: 2008,
    director: "Christopher Nolan",
    genre: "Ação",
    runtime: 152,
    rating: 9.0,
    synopsis: "Batman enfrenta o Coringa, um criminoso caótico que quer mergulhar Gotham City na anarquia.",
  },
  {
    title: "12 Angry Men",
    year: 1957,
    director: "Sidney Lumet",
    genre: "Drama",
    runtime: 96,
    rating: 9.0,
    synopsis: "Um jurado tenta impedir um erro judicial forçando seus colegas a reconsiderar as evidências.",
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    director: "Quentin Tarantino",
    genre: "Crime",
    runtime: 154,
    rating: 8.9,
    synopsis:
      "As vidas de dois assassinos, um boxeador e um casal de assaltantes se entrelaçam em quatro histórias de violência e redenção.",
  },
  {
    title: "Schindler's List",
    year: 1993,
    director: "Steven Spielberg",
    genre: "Drama",
    runtime: 195,
    rating: 9.0,
    synopsis: "Um empresário salva a vida de mais de mil refugiados judeus durante o Holocausto.",
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
    director: "Peter Jackson",
    genre: "Fantasia",
    runtime: 201,
    rating: 9.0,
    synopsis:
      "Gandalf e Aragorn lideram o mundo dos homens contra o exército de Sauron enquanto Frodo se aproxima da Montanha da Perdição.",
  },
  {
    title: "Forrest Gump",
    year: 1994,
    director: "Robert Zemeckis",
    genre: "Drama",
    runtime: 142,
    rating: 8.8,
    synopsis:
      "As décadas na vida de um homem simples do Alabama que, sem querer, influencia eventos históricos dos EUA.",
  },
  {
    title: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    genre: "Ficção Científica",
    runtime: 148,
    rating: 8.8,
    synopsis:
      "Um ladrão que rouba segredos através dos sonhos recebe a tarefa impossível de plantar uma ideia na mente de alguém.",
  },
  {
    title: "Fight Club",
    year: 1999,
    director: "David Fincher",
    genre: "Drama",
    runtime: 139,
    rating: 8.8,
    synopsis: "Um insone e um vendedor de sabão formam um clube de luta clandestino que evolui para algo muito maior.",
  },
  {
    title: "The Matrix",
    year: 1999,
    director: "The Wachowskis",
    genre: "Ficção Científica",
    runtime: 136,
    rating: 8.7,
    synopsis: "Um hacker descobre que a realidade é uma simulação e se junta à rebelião contra as máquinas.",
  },
  {
    title: "Goodfellas",
    year: 1990,
    director: "Martin Scorsese",
    genre: "Crime",
    runtime: 145,
    rating: 8.7,
    synopsis: "A ascensão e queda de um mafioso ao longo de três décadas na máfia de Nova York.",
  },
  {
    title: "Interstellar",
    year: 2014,
    director: "Christopher Nolan",
    genre: "Ficção Científica",
    runtime: 169,
    rating: 8.7,
    synopsis: "Exploradores atravessam um buraco de minhoca em busca de um novo lar para a humanidade.",
  },
  {
    title: "Se7en",
    year: 1995,
    director: "David Fincher",
    genre: "Suspense",
    runtime: 127,
    rating: 8.6,
    synopsis: "Dois detetives caçam um serial killer que usa os sete pecados capitais como método.",
  },
  {
    title: "Spirited Away",
    year: 2001,
    director: "Hayao Miyazaki",
    genre: "Animação",
    runtime: 125,
    rating: 8.6,
    synopsis: "Uma menina entra em um mundo mágico de espíritos e precisa trabalhar para libertar seus pais.",
  },
  {
    title: "The Silence of the Lambs",
    year: 1991,
    director: "Jonathan Demme",
    genre: "Suspense",
    runtime: 118,
    rating: 8.6,
    synopsis: "Uma jovem agente do FBI busca ajuda de um assassino canibal para capturar outro serial killer.",
  },
  {
    title: "Parasite",
    year: 2019,
    director: "Bong Joon-ho",
    genre: "Drama",
    runtime: 132,
    rating: 8.5,
    synopsis: "Uma família pobre se infiltra na casa de uma família rica com consequências imprevisíveis.",
  },
  {
    title: "Whiplash",
    year: 2014,
    director: "Damien Chazelle",
    genre: "Drama",
    runtime: 106,
    rating: 8.5,
    synopsis: "Um jovem baterista enfrenta um instrutor implacável em busca da perfeição musical.",
  },
  {
    title: "Gladiator",
    year: 2000,
    director: "Ridley Scott",
    genre: "Ação",
    runtime: 155,
    rating: 8.5,
    synopsis: "Um general romano traído busca vingança contra o imperador corrupto que assassinou sua família.",
  },
  {
    title: "The Departed",
    year: 2006,
    director: "Martin Scorsese",
    genre: "Crime",
    runtime: 151,
    rating: 8.5,
    synopsis: "Um policial infiltrado e um espião da máfia tentam se identificar antes de serem descobertos.",
  },
]

const FALLBACK_MOVIE_POPULAR: Seed[] = [
  {
    title: "Everything Everywhere All at Once",
    year: 2022,
    director: "Daniels",
    genre: "Ficção Científica",
    runtime: 139,
    rating: 9.3,
    synopsis:
      "Uma dona de lavanderia descobre que precisa conectar-se a versões de si mesma no multiverso para salvar a existência.",
  },
  {
    title: "Get Out",
    year: 2017,
    director: "Jordan Peele",
    genre: "Terror",
    runtime: 104,
    rating: 8.8,
    synopsis: "Um jovem descobre um segredo aterrorizante ao visitar a família da namorada no fim de semana.",
  },
  {
    title: "Mad Max: Fury Road",
    year: 2015,
    director: "George Miller",
    genre: "Ação",
    runtime: 120,
    rating: 8.7,
    synopsis: "Em um deserto pós-apocalíptico, dois rebeldes fogem de um tirano em uma perseguição frenética.",
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    director: "Bob Persichetti",
    genre: "Animação",
    runtime: 117,
    rating: 8.7,
    synopsis: "Miles Morales une forças com Homens-Aranha de outras dimensões para salvar o multiverso.",
  },
  {
    title: "Knives Out",
    year: 2019,
    director: "Rian Johnson",
    genre: "Mistério",
    runtime: 130,
    rating: 8.7,
    synopsis: "Um detetive excêntrico investiga a morte enigmática do patriarca de uma família rica.",
  },
  {
    title: "Coco",
    year: 2017,
    director: "Lee Unkrich",
    genre: "Animação",
    runtime: 105,
    rating: 8.7,
    synopsis: "Um menino embarca em uma jornada pela Terra dos Mortos para descobrir a história de sua família.",
  },
  {
    title: "Black Panther",
    year: 2018,
    director: "Ryan Coogler",
    genre: "Ação",
    runtime: 134,
    rating: 8.6,
    synopsis: "O rei de Wakanda precisa defender seu trono e seu país de uma ameaça vinda do passado.",
  },
  {
    title: "The Social Network",
    year: 2010,
    director: "David Fincher",
    genre: "Drama",
    runtime: 120,
    rating: 8.6,
    synopsis: "A criação do Facebook e as disputas legais e pessoais que vieram com o sucesso repentino.",
  },
  {
    title: "Moonlight",
    year: 2016,
    director: "Barry Jenkins",
    genre: "Drama",
    runtime: 111,
    rating: 8.8,
    synopsis: "Três capítulos na vida de um jovem enquanto ele descobre sua identidade em Miami.",
  },
  {
    title: "Arrival",
    year: 2016,
    director: "Denis Villeneuve",
    genre: "Ficção Científica",
    runtime: 116,
    rating: 8.4,
    synopsis: "Uma linguista tenta se comunicar com visitantes alienígenas antes que o mundo entre em guerra.",
  },
  {
    title: "La La Land",
    year: 2016,
    director: "Damien Chazelle",
    genre: "Musical",
    runtime: 128,
    rating: 8.1,
    synopsis: "Uma atriz e um pianista de jazz se apaixonam enquanto perseguem seus sonhos em Los Angeles.",
  },
  {
    title: "Dune",
    year: 2021,
    director: "Denis Villeneuve",
    genre: "Ficção Científica",
    runtime: 155,
    rating: 8.3,
    synopsis:
      "O herdeiro de uma casa nobre precisa proteger o recurso mais valioso do universo em um planeta desértico.",
  },
  {
    title: "1917",
    year: 2019,
    director: "Sam Mendes",
    genre: "Guerra",
    runtime: 119,
    rating: 8.9,
    synopsis: "Dois soldados britânicos recebem a missão de atravessar território inimigo para salvar um batalhão.",
  },
  {
    title: "Little Women",
    year: 2019,
    director: "Greta Gerwig",
    genre: "Drama",
    runtime: 135,
    rating: 8.5,
    synopsis: "As irmãs March amadurecem e perseguem seus sonhos na Nova Inglaterra pós-Guerra Civil.",
  },
  {
    title: "Toy Story",
    year: 1995,
    director: "John Lasseter",
    genre: "Animação",
    runtime: 81,
    rating: 8.3,
    synopsis: "Brinquedos ganham vida e enfrentam ciúmes e aventura quando um novo boneco chega ao quarto.",
  },
  {
    title: "A Star Is Born",
    year: 2018,
    director: "Bradley Cooper",
    genre: "Romance",
    runtime: 136,
    rating: 8.0,
    synopsis: "Um músico veterano descobre e se apaixona por uma jovem cantora em ascensão.",
  },
  {
    title: "Casablanca",
    year: 1942,
    director: "Michael Curtiz",
    genre: "Romance",
    runtime: 102,
    rating: 8.5,
    synopsis: "Um dono de bar cínico reencontra um antigo amor em meio à guerra na Casablanca ocupada.",
  },
  {
    title: "Citizen Kane",
    year: 1941,
    director: "Orson Welles",
    genre: "Drama",
    runtime: 119,
    rating: 8.4,
    synopsis: "A investigação sobre a última palavra de um magnata revela os enigmas de uma vida grandiosa e solitária.",
  },
  {
    title: "Lady Bird",
    year: 2017,
    director: "Greta Gerwig",
    genre: "Comédia",
    runtime: 94,
    rating: 7.9,
    synopsis: "Uma adolescente rebelde vive um último ano turbulento com a mãe em Sacramento.",
  },
  {
    title: "The Wizard of Oz",
    year: 1939,
    director: "Victor Fleming",
    genre: "Fantasia",
    runtime: 102,
    rating: 8.1,
    synopsis: "Uma menina é levada por um tornado a uma terra mágica e busca o caminho de volta para casa.",
  },
]

const FALLBACK_TV_TOP: Seed[] = [
  {
    title: "Breaking Bad",
    year: 2008,
    genre: "Drama",
    rating: 8.9,
    synopsis:
      "Um professor de química com câncer terminal começa a produzir metanfetamina para garantir o futuro da família.",
  },
  {
    title: "Band of Brothers",
    year: 2001,
    genre: "Guerra",
    rating: 8.7,
    synopsis: "A jornada de uma companhia de paraquedistas americanos da invasão da Normandia ao fim da guerra.",
  },
  {
    title: "Chernobyl",
    year: 2019,
    genre: "Drama",
    rating: 8.6,
    synopsis: "A dramatização do desastre nuclear de 1986 e dos sacrifícios feitos para conter a catástrofe.",
  },
  {
    title: "The Wire",
    year: 2002,
    genre: "Crime",
    rating: 8.6,
    synopsis: "Diferentes camadas da cidade de Baltimore vistas pelas lentes do tráfico e da polícia.",
  },
  {
    title: "Game of Thrones",
    year: 2011,
    genre: "Fantasia",
    rating: 8.4,
    synopsis: "Famílias nobres disputam o Trono de Ferro enquanto uma ameaça ancestral desperta no Norte.",
  },
  {
    title: "The Sopranos",
    year: 1999,
    genre: "Crime",
    rating: 8.6,
    synopsis: "Um chefe da máfia de Nova Jersey equilibra a vida familiar e o comando do crime organizado.",
  },
  {
    title: "Avatar: The Last Airbender",
    year: 2005,
    genre: "Animação",
    rating: 8.7,
    synopsis: "Um jovem dominador do ar precisa dominar os quatro elementos para acabar com uma guerra mundial.",
  },
  {
    title: "Rick and Morty",
    year: 2013,
    genre: "Animação",
    rating: 8.7,
    synopsis: "Um cientista genial e alcoólatra arrasta o neto para aventuras interdimensionais caóticas.",
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    year: 2009,
    genre: "Animação",
    rating: 8.8,
    synopsis: "Dois irmãos buscam a pedra filosofal para recuperar seus corpos após um experimento fracassado.",
  },
  {
    title: "The Last of Us",
    year: 2023,
    genre: "Drama",
    rating: 8.6,
    synopsis: "Um contrabandista escolta uma adolescente imune por um mundo devastado por uma pandemia fúngica.",
  },
  {
    title: "Better Call Saul",
    year: 2015,
    genre: "Crime",
    rating: 8.6,
    synopsis: "A transformação de um advogado bem-intencionado no inescrupuloso Saul Goodman.",
  },
  {
    title: "True Detective",
    year: 2014,
    genre: "Crime",
    rating: 8.4,
    synopsis: "Dois detetives caçam um serial killer ao longo de 17 anos no interior da Louisiana.",
  },
  {
    title: "Sherlock",
    year: 2010,
    genre: "Mistério",
    rating: 8.4,
    synopsis: "Uma releitura moderna do detetive Sherlock Holmes resolvendo crimes na Londres atual.",
  },
  {
    title: "Dark",
    year: 2017,
    genre: "Ficção Científica",
    rating: 8.4,
    synopsis: "O desaparecimento de crianças revela uma conspiração de viagens no tempo em uma cidade alemã.",
  },
  {
    title: "Attack on Titan",
    year: 2013,
    genre: "Animação",
    rating: 8.7,
    synopsis: "A humanidade luta pela sobrevivência atrás de muralhas contra titãs devoradores de pessoas.",
  },
  {
    title: "Planet Earth II",
    year: 2016,
    genre: "Documentário",
    rating: 8.9,
    synopsis: "Uma jornada visual deslumbrante pelos habitats mais extraordinários do nosso planeta.",
  },
]

const FALLBACK_TV_POPULAR: Seed[] = [
  {
    title: "Stranger Things",
    year: 2016,
    genre: "Ficção Científica",
    rating: 8.6,
    synopsis: "Um grupo de crianças enfrenta forças sobrenaturais e experimentos secretos em uma cidadezinha.",
  },
  {
    title: "The Boys",
    year: 2019,
    genre: "Ação",
    rating: 8.4,
    synopsis: "Um grupo de justiceiros combate super-heróis corruptos controlados por uma poderosa corporação.",
  },
  {
    title: "Wednesday",
    year: 2022,
    genre: "Comédia",
    rating: 8.1,
    synopsis: "Wednesday Addams investiga mistérios sombrios enquanto estuda na Escola Nevermore.",
  },
  {
    title: "The Mandalorian",
    year: 2019,
    genre: "Ficção Científica",
    rating: 8.4,
    synopsis: "Um caçador de recompensas solitário protege uma criança misteriosa na fronteira da galáxia.",
  },
  {
    title: "House of the Dragon",
    year: 2022,
    genre: "Fantasia",
    rating: 8.4,
    synopsis: "A casa Targaryen entra em guerra civil pela sucessão do Trono de Ferro, dois séculos antes de GoT.",
  },
  {
    title: "The Bear",
    year: 2022,
    genre: "Drama",
    rating: 8.3,
    synopsis: "Um chef premiado assume a lanchonete caótica da família após uma tragédia.",
  },
  {
    title: "Loki",
    year: 2021,
    genre: "Ficção Científica",
    rating: 8.2,
    synopsis: "O deus da trapaça é recrutado por uma agência que monitora a linha do tempo do multiverso.",
  },
  {
    title: "Peaky Blinders",
    year: 2013,
    genre: "Crime",
    rating: 8.4,
    synopsis: "Uma gangue familiar expande seu império criminoso na Birmingham do pós-Primeira Guerra.",
  },
  {
    title: "Arcane",
    year: 2021,
    genre: "Animação",
    rating: 8.7,
    synopsis: "Duas irmãs se veem em lados opostos de um conflito entre cidades tecnológicas rivais.",
  },
  {
    title: "The Witcher",
    year: 2019,
    genre: "Fantasia",
    rating: 8.0,
    synopsis: "Um caçador de monstros mutante cruza destinos com uma feiticeira e uma princesa em um continente conturbado.",
  },
  {
    title: "Ted Lasso",
    year: 2020,
    genre: "Comédia",
    rating: 8.3,
    synopsis: "Um treinador de futebol americano assume um time de futebol inglês sem entender nada do esporte.",
  },
  {
    title: "Severance",
    year: 2022,
    genre: "Ficção Científica",
    rating: 8.4,
    synopsis: "Funcionários passam por um procedimento que separa suas memórias do trabalho e da vida pessoal.",
  },
  {
    title: "The Crown",
    year: 2016,
    genre: "Drama",
    rating: 8.2,
    synopsis: "O reinado da rainha Elizabeth II e os bastidores políticos e pessoais da monarquia britânica.",
  },
  {
    title: "Fallout",
    year: 2024,
    genre: "Ficção Científica",
    rating: 8.4,
    synopsis: "Sobreviventes disputam recursos em uma Los Angeles pós-apocalíptica, séculos após uma guerra nuclear.",
  },
  {
    title: "Money Heist",
    year: 2017,
    genre: "Crime",
    rating: 8.2,
    synopsis: "Um estrategista recruta oito ladrões para o maior assalto da história à Casa da Moeda da Espanha.",
  },
  {
    title: "Squid Game",
    year: 2021,
    genre: "Suspense",
    rating: 7.8,
    synopsis: "Centenas de pessoas endividadas arriscam a vida em jogos infantis mortais por um prêmio milionário.",
  },
]

function build(seeds: Seed[], mediaType: MediaType): Title[] {
  return seeds.map((m, i) => ({
    ...m,
    genres: [m.genre],
    id: slug(m.title),
    poster: null,
    rank: i + 1,
    mediaType,
  }))
}

export const FALLBACK: Record<MediaType, Record<ListKind, Title[]>> = {
  movie: {
    imdb: build(FALLBACK_MOVIE_TOP, "movie"),
    top: build(FALLBACK_MOVIE_TOP, "movie"),
    popular: build(FALLBACK_MOVIE_POPULAR, "movie"),
  },
  tv: {
    imdb: build(FALLBACK_TV_TOP, "tv"),
    top: build(FALLBACK_TV_TOP, "tv"),
    popular: build(FALLBACK_TV_POPULAR, "tv"),
  },
}

export function getGenres(titles: Title[]): string[] {
  const set = new Set(titles.flatMap((m) => m.genres))
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))
}

export function hasGenre(t: Title, genre: string) {
  return t.genres.includes(genre)
}

export function getDecades(titles: Title[]): number[] {
  const set = new Set(titles.filter((t) => t.year > 0).map((t) => Math.floor(t.year / 10) * 10))
  return Array.from(set).sort((a, b) => b - a)
}

export function inDecade(t: Title, decade: number) {
  return t.year >= decade && t.year < decade + 10
}
