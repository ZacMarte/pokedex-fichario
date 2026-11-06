import ExcelJS from 'exceljs';

const GENERATIONS = [
  { id: 1, name: 'Kanto', start: 1, end: 151 },
  { id: 2, name: 'Johto', start: 152, end: 251 },
  { id: 3, name: 'Hoenn', start: 252, end: 386 },
  { id: 4, name: 'Sinnoh', start: 387, end: 493 },
  { id: 5, name: 'Unova', start: 494, end: 649 },
  { id: 6, name: 'Kalos', start: 650, end: 721 },
  { id: 7, name: 'Alola', start: 722, end: 809 },
  { id: 8, name: 'Galar', start: 810, end: 905 },
  { id: 9, name: 'Paldea', start: 906, end: 1025 }
];

const getGeneration = (id) => GENERATIONS.find(g => id >= g.start && id <= g.end);

export async function exportMissingToExcel(missingPokemon) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pokémons Faltantes');

    worksheet.columns = [
      { header: 'Número', key: 'number', width: 15 },
      { header: 'Nome', key: 'name', width: 40 },
    ];

    // Estilo do cabeçalho geral
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Montserrat', bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF101014' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Agrupar pokémons
    const groupedByGen = {};
    missingPokemon.forEach(p => {
      const gen = getGeneration(p.id);
      if (!groupedByGen[gen.id]) {
        groupedByGen[gen.id] = { gen, pokemons: [] };
      }
      groupedByGen[gen.id].pokemons.push(p);
    });

    // Adiciona os grupos
    Object.values(groupedByGen).forEach(({ gen, pokemons }) => {
      
      // Linha de título da geração
      const genRow = worksheet.addRow([`GERAÇÃO ${gen.id}: ${gen.name.toUpperCase()}`, '']);
      worksheet.mergeCells(`A${genRow.number}:B${genRow.number}`);
      
      genRow.font = { name: 'Montserrat', bold: true, size: 12, color: { argb: 'FF101014' } };
      
      // 🔥 A MÁGICA ACONTECE AQUI: Aumentamos a altura da linha do cabeçalho 
      // e alinhamos o texto para a parte de baixo, criando um "espaço" em cima.
      genRow.height = 40; 
      
      [1, 2].forEach(colIndex => {
        const cell = genRow.getCell(colIndex);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB6F278' } };
        // Alinha o texto na parte inferior para o "espaço" ficar em cima
        cell.alignment = { vertical: 'bottom', horizontal: 'left', indent: 1, padding: { top: 10 } };
      });

      // Linhas dos pokémons
      pokemons.forEach(p => {
        const row = worksheet.addRow({
          number: `#${String(p.id).padStart(3, '0')}`,
          name: p.name,
        });

        row.font = { name: 'Montserrat', size: 11 };
        row.height = 18;
        
        [1, 2].forEach(colIndex => {
          const cell = row.getCell(colIndex);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pokemons_faltantes.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    alert('Ocorreu um erro ao gerar a planilha.');
  }
}