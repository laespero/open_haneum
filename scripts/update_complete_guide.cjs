const fs = require(\'fs\');
const path = require(\'path\');

const guideFilePath = path.join(__dirname, \'..\', \'know_how\', \'complete_guide.md\');

try {
  let content = fs.readFileSync(guideFilePath, \'utf-8\');

  // 1. 섹션 2의 필드 설명 수정
  // R0, R1, XR, XI 등의 설명을 보다 명확하게 변경
  content = content.replace(
    new RegExp(\'(\\*\\s*`R0`:\\s*).*\', \'g\'),
    \'$1\"**원문 전체(`T0`)의 한글 발음 표기.** 예: `R0: \"짜이 츠 인 창 저 시 누 쏘트 잇츠 프리티 쿨\"`\'
  );
  content = content.replace(
    new RegExp(\'(\\*\\s*`R1`:\\s*).*\', \'g\'),
    \'$1\"**`T1`의 한글 발음 표기.** 예: `R1: \"쏘트\"`\'
  );
  // R2 설명 추가 (R1과 유사하게)
  content = content.replace(
    new RegExp(\'(XR\": \"예문 관련 참고자료 \\(선택적\\)\")'), // No g flag, already specific
    \'$1,\n          \"R2\": \"**`T2`의 한글 발음 표기.**\"\'
  );
  content = content.replace(
    new RegExp(\'(\\*\\s*`XR`:\\s*).*\', \'g\'),
    \'$1\"**예문 원문(`XE`)의 한글 발음 표기.** 예: `XR: \"아이 쏘트 유 워 커밍\"`\'
  );
  content = content.replace(
    new RegExp(\'(\\*\\s*`XI`:\\s*).*\', \'g\'),
    \'$1\"**예문 원문(`XE`)의 병음(중국어) 또는 IPA(영어 등) 표기.** 경우에 따라 이미지 URL 등으로 사용될 수도 있음. 예: `XI: \"aɪ θɔt ju wɜr ˈkʌmɪŋ\"`\'
  );
  // I0, I1, I2 설명 추가 (XI와 유사하게)
  if (!content.includes(\'`I0`:\')) {
    content = content.replace(
        new RegExp(\'(R0\": \"번역 관련 참고 자료\\/루비 텍스트 등\")'), // No g flag
        \'$1,\n          \"I0\": \"**원문 전체(`T0`)의 병음(중국어) 또는 IPA(영어 등) 표기.**\"\'
    );
  }
   if (!content.includes(\'`I1`:\')) {
    content = content.replace(
        new RegExp(\'(R1\": \"T1 관련 참고 자료\\/루비 텍스트\")'), // No g flag
        \'$1,\n          \"I1\": \"**`T1`의 병음(중국어) 또는 IPA(영어 등) 표기.**\"\'
    );
  }
  if (!content.includes(\'`I2`:\')) {
    content = content.replace(
        new RegExp(\'(R2\": \"\\*\\*`T2`의 한글 발음 표기\\.\\*\\*\")'), // No g flag, careful with escaping meta-characters in regex string
        \'$1,\n          \"I2\": \"**`T2`의 병음(중국어) 또는 IPA(영어 등) 표기.**\"\'
    );
  }


  // 2. 새로운 섹션 "6. 데이터 품질 향상을 위한 상세 가이드라인" 추가
  const newSectionTitle = \'\\n\\n## 6. 데이터 품질 향상을 위한 상세 가이드라인\';
  const newSectionContent = `
${newSectionTitle}

이 섹션에서는 데이터의 정확성과 일관성을 높이기 위한 구체적인 가이드라인을 제공합니다.

### 6.1. 예문 (XE/XK) 작성 가이드

*   **문맥 반영**: 예문은 해당 단어나 구문이 사용된 원본 가사(\`T0\`)의 문맥을 최대한 반영해야 합니다. 원본 가사의 분위기나 상황과 동떨어진 예문은 지양합니다.
*   **정확한 번역**: \`XK\`(예문 번역)는 \`XE\`(예문 원문)를 정확하고 자연스럽게 번역해야 합니다.
*   **발음 정보 일치**: 중국어 예문의 경우, \`XI\`(병음)와 \`XR\`(한글 발음)은 \`XE\`의 실제 발음과 일치해야 하며, 상호 간에도 내용이 일치해야 합니다.
*   **간결성 및 명확성**: 예문은 너무 길거나 복잡하지 않게, 해당 단어의 쓰임새를 명확히 보여주는 것이 좋습니다.

### 6.2. 발음 표기 (R0, R1, R2, XR) 가이드라인

정확한 한글 발음 표기는 사용자의 이해를 돕고 데이터의 활용도를 높입니다.

#### 6.2.1. 중국어 한글 표기

*   **표준 표기법 준수**: 문화체육관광부의 중국어 외래어 표기법을 기본으로 하되, 실제 발음과 교육적 효과를 고려하여 일부 관용적인 표기를 허용할 수 있습니다.
*   **성조 변화 반영 노력**: 경성이나 성조 변화가 발음에 영향을 주는 경우, 이를 한글 표기에 반영하려고 노력합니다. (예: " bù " 뒤의 4성 -> " bú ")
*   **자주 틀리는 발음 주의**:
    *   人 (rén): "런" 또는 "른"으로 표기 (예: "人民" -> "런민")
    *   亨 (hēng): "헝"으로 표기
    *   "르" 발음 최소화: "re", "le" 등의 발음 시 "르"보다는 원음에 가까운 다른 표기를 우선 고려합니다.
*   **띄어쓰기**:
    *   기본적으로 중국어의 각 음절(한자) 단위로 붙여 쓰는 것을 원칙으로 하나, 가독성을 위해 의미 단위나 관용에 따라 띄어쓸 수 있습니다.
    *   특히, 다수의 한글 발음이 이어질 때 발음의 구분을 명확히 하기 위해 필요한 경우 적절히 띄어씁니다. (예: "저리르헌두어" -> "저 리 런 헌 두어")
*   **구체적 예시**:
    *   水 (shuǐ): "쉐이" (shui [ʂwéi])
    *   作 (zuò): "쭈어" (zuo [tswɔ̂])
    *   月 (yuè): "위에"

#### 6.2.2. 영어 및 기타 외국어 한글 표기

*   **원어 철자 지양**: \`R0\`, \`R1\`, \`R2\`, \`XR\` 필드에 영어 등 외국어 발음을 표기할 때는 원어 철자를 그대로 사용하지 않고, **국립국어원의 외래어 표기법**을 준수하여 한글로 표기합니다.
*   **IPA 참고**: 발음 기호(IPA)가 \`I0\`, \`I1\`, \`I2\`, \`XI\` 등에 제공된 경우, 이를 참고하여 최대한 원음에 가깝게 한글로 표기합니다.
    *   예: "thought" (IPA: θɔt) -> "쏘트"
    *   예: "it\'s" (IPA: ɪts) -> "잇츠"

### 6.3. 병음/IPA 표기 (I0, I1, I2, XI) 가이드라인

*   **중국어 병음**:
    *   **성조 부호 사용**: 숫자 성조(예: \`fa1 xian4\`) 대신 반드시 성조 부호(예: \`fāxiàn\`)를 사용합니다. (āáǎà, ēéěè, īíǐì, ōóǒò, ūúǔù,ǖǘǚǜ)
    *   **정확한 성모/운모**: 표준 중국어 발음에 따라 정확한 성모와 운모를 사용합니다.
*   **영어 및 기타 외국어**:
    *   해당 언어의 표준 발음 기호인 **IPA(International Phonetic Alphabet)**를 사용합니다.
    *   발음 기호는 정확해야 하며, 필요시 온라인 사전 등의 신뢰할 수 있는 출처를 참고합니다.

### 6.4. 단어/구문 설명 (E1, E2, G0) 가이드라인

*   **간결하고 명확한 설명**: \`E1\`, \`E2\` 필드는 해당 단어(\`T1\`, \`T2\`)의 문법적 기능, 의미, 뉘앙스 등을 간결하고 명확하게 설명해야 합니다.
*   **축약어 및 비격식 표현**:
    *   "ain\'t", "gonna" 등 축약어나 비격식 표현을 설명할 때는 가능한 모든 원형을 나열하기보다, **해당 문맥에서 가장 적절한 원형과 그 의미를 중심으로 설명**합니다.
    *   예: \`T1: "ain\\'t"\` 이고 문맥상 "have not"을 의미한다면, \`E1\`은 "'have not'의 비격식 표현입니다."와 같이 작성합니다.
*   **필드 간 일관성 (T2, I2, R2, E2)**:
    *   만약 \`T1\`의 원형/대응 표현으로 \`T2\`를 제공하는 경우, \`T2\`의 내용이 변경되면 반드시 그 발음 정보인 \`I2\`(IPA/병음)와 \`R2\`(한글 발음), 그리고 설명인 \`E2\`도 \`T2\`와 일관성 있게 업데이트되어야 합니다.

### 6.5. 데이터 일관성 종합 강조

모든 데이터 필드는 서로 긴밀하게 연결되어 있습니다. 하나의 필드를 수정할 때는 관련된 다른 필드들(\`T0\`, \`K0\`, \`R0\`, \`I0\`, \`LI\` 내부의 모든 필드)과의 의미적, 내용적 일관성이 깨지지 않도록 세심한 주의가 필요합니다. 예를 들어, \`XE\` 예문을 수정했다면 \`XK\`, \`XI\`, \`XR\`도 반드시 함께 검토하고 수정해야 합니다.

스크립트를 사용한 일괄 수정 시에도, 수정 대상과 범위를 정확히 지정하여 의도치 않은 변경이 발생하지 않도록 주의해야 합니다.
`;

  // "## 5. 결론" 섹션 뒤에 새 섹션 삽입
  const conclusionMarker = \'## 5. 결론\';
  const insertionPoint = content.indexOf(conclusionMarker);

  if (insertionPoint !== -1) {
    // 5. 결론 섹션의 시작점을 찾고, 그 바로 앞이나 뒤에 추가할 수 있습니다.
    // 여기서는 "## deep_damashiai_translation_refinement_log.md" 가 있다면 그 앞에, 없다면 파일 끝에 추가합니다.
    const nextSectionMarker = content.indexOf(\'\\n## \', insertionPoint + conclusionMarker.length);
    if (nextSectionMarker !== -1) {
      content = content.slice(0, nextSectionMarker) + newSectionContent + \'\\n\' + content.slice(nextSectionMarker);
    } else {
      // "5. 결론"이 마지막 주요 섹션인 경우
      content += newSectionContent;
    }
  } else {
    // "## 5. 결론" 마커를 찾지 못한 경우, 파일 끝에 추가
    console.warn(\'Warning: "## 5. 결론" marker not found. Appending new section to the end of the file.\');
    content += newSectionContent;
  }

  fs.writeFileSync(guideFilePath, content, \'utf-8\');
  console.log(\`Successfully updated ${guideFilePath} with new guidelines.\`);

} catch (error) {
  console.error(\'Error processing the guide file:\', error);
} 