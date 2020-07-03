interface E2EScreenShootResult {
  image: string;
  expectedImage: string;
  actualImage: string;
  diffImage: string;
  similarityRate: number;
}

interface E2EErrorResult {
  image: string;
  expectedImage: string;
  errorMsg: string;
}

type E2EResult = E2EErrorResult | E2EScreenShootResult;

export function diffImageResult(expectedDir: string, actualDir: string, image: string): E2EScreenShootResult {
  console.log(expectedDir);
  console.log(actualDir);
  console.log(image);
  return null;
}
