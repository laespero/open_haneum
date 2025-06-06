import fs from 'fs/promises';
import path from 'path';

const songsDir = 'songs';
const outputFile = 'songSearch.json'; // 결과물은 프로젝트 루트에 생성

async function createSearchIndex() {
  try {
    const files = await fs.readdir(songsDir);
    const searchIndex = [];

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(songsDir, file);
        try {
          const data = await fs.readFile(filePath, 'utf8');
          const song = JSON.parse(data);

          // "개발용" 태그가 있으면 인덱스에 추가하지 않음
          if (song.tags && song.tags.includes('개발용')) {
            continue;
          }

          // 검색과 목록 표시에 필요한 최소한의 데이터만 추출
          const searchData = {
            name: song.name,
            ori_name: song.ori_name,
            kor_name: song.kor_name,
            eng_name: song.eng_name,
            artist: song.artist,
            tags: song.tags,
            createdAt: song.createdAt,
            // 나중에 원본 파일을 찾기 위해 파일명 저장
            filename: file 
          };
          searchIndex.push(searchData);

        } catch (parseErr) {
          console.error(`Error processing file '${filePath}':`, parseErr);
        }
      }
    }

    // 최신순으로 정렬. createdAt이 없는 경우 가장 나중에 오도록 처리
    searchIndex.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : null;
      const dateB = b.createdAt ? new Date(b.createdAt) : null;

      if (dateA && dateB) {
        return dateB - dateA; // 둘 다 날짜가 있으면 최신순
      }
      if (dateA) {
        return -1; // a만 날짜가 있으면 a가 먼저
      }
      if (dateB) {
        return 1; // b만 날짜가 있으면 b가 먼저
      }
      return 0; // 둘 다 날짜가 없으면 순서 유지
    });

    await fs.writeFile(outputFile, JSON.stringify(searchIndex, null, 2));
    console.log(`Successfully created search index with ${searchIndex.length} songs at ${outputFile}`);
  } catch (err) {
    console.error('Error creating search index:', err);
  }
}

createSearchIndex(); 