import { execSync } from 'child_process';

function generateAndRunMigration() {
  const migrationName = process.argv[2] || `Migration${Date.now()}`;
  const migrationPath = `src/migrations/${migrationName}`;

  try {
    console.log('Gerando migration baseada nas entidades...');
    execSync(
      `typeorm-ts-node-commonjs migration:generate ${migrationPath} -d data-source.ts`,
      { stdio: 'inherit', cwd: process.cwd() },
    );

    console.log('\nExecutando migrations...');
    execSync('typeorm-ts-node-commonjs migration:run -d data-source.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('\nMigrations executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exit(1);
  }
}

generateAndRunMigration();
