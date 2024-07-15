import { join } from 'path';

// 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd();
// 외부에서 접근 가능한 파일들을 모아둔 패스

export const PUBLIC_FOLDER_NAME = 'public';

// 아티클 폴더
export const ARTICLES_FOLDER_NAME = 'articles';

// 임시폴더
export const TEMP_FOLDER_NAME = 'temp';

//실제 공개 폴더의 절대 경로
// /{프로젝트 위치}/public

export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);
export const ARTCILES_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  ARTICLES_FOLDER_NAME,
);

// 절대 경로x
// /public/articles/xxx.jpg
// 클라이언트 http://localhost:5500/public/articles/xxx.jpg

export const ARTICLES_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  ARTICLES_FOLDER_NAME,
);

// /{}/temp
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
