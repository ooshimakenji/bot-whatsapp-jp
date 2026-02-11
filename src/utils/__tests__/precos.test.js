const {
  calcularPrecoSofa,
  calcularPrecoAr,
  extrairAnaliseImagem,
  limparAnaliseParaCliente,
  gerarMensagemEstimativa,
} = require('../precos');

describe('calcularPrecoSofa', () => {
  test('sofá de 3 lugares tecido sem extras', () => {
    const resultado = calcularPrecoSofa({ lugares: 3, material: 'tecido' });
    expect(resultado.minimo).toBe(150);
    expect(resultado.maximo).toBe(180);
  });

  test('sofá de 2 lugares couro com manchas', () => {
    const resultado = calcularPrecoSofa({ lugares: 2, material: 'couro', manchas: 'sim' });
    expect(resultado.minimo).toBe(120 + 30 + 30); // base + couro + manchas
  });

  test('poltrona com pet', () => {
    const resultado = calcularPrecoSofa({ lugares: 1, material: 'tecido', tem_pet: true });
    expect(resultado.minimo).toBe(80 + 25); // base + pet
  });

  test('sofá muito sujo', () => {
    const resultado = calcularPrecoSofa({ lugares: 3, estado: 'ruim' });
    expect(resultado.minimo).toBe(150 + 50); // base + muito sujo
  });

  test('usa 3 lugares como padrão se não informar', () => {
    const resultado = calcularPrecoSofa({});
    expect(resultado.minimo).toBe(150);
  });
});

describe('calcularPrecoAr', () => {
  test('split simples', () => {
    const resultado = calcularPrecoAr({ modelo_ar: 'split' });
    expect(resultado.minimo).toBe(120);
  });

  test('cassete sujo', () => {
    const resultado = calcularPrecoAr({ modelo_ar: 'cassete', estado: 'ruim' });
    expect(resultado.minimo).toBe(180 + 40);
  });

  test('janela estado médio', () => {
    const resultado = calcularPrecoAr({ modelo_ar: 'janela', estado: 'medio' });
    expect(resultado.minimo).toBe(80 + 20);
  });
});

describe('extrairAnaliseImagem', () => {
  test('extrai dados de tag [ANALISE: ...]', () => {
    const texto = 'Seu sofá está bom!\n[ANALISE: tipo=sofa, lugares=3, material=tecido, estado=bom]';
    const dados = extrairAnaliseImagem(texto);
    expect(dados.tipo).toBe('sofa');
    expect(dados.lugares).toBe('3');
    expect(dados.material).toBe('tecido');
  });

  test('retorna null se não tiver tag', () => {
    const dados = extrairAnaliseImagem('Só um texto normal');
    expect(dados).toBeNull();
  });

  test('ignora valores X e none', () => {
    const texto = '[ANALISE: tipo=sofa, modelo_ar=none, cor=X]';
    const dados = extrairAnaliseImagem(texto);
    expect(dados.tipo).toBe('sofa');
    expect(dados.modelo_ar).toBeUndefined();
    expect(dados.cor).toBeUndefined();
  });
});

describe('limparAnaliseParaCliente', () => {
  test('remove tag [ANALISE: ...] do texto', () => {
    const texto = 'Recebi a foto!\n[ANALISE: tipo=sofa, lugares=3]';
    const limpo = limparAnaliseParaCliente(texto);
    expect(limpo).toBe('Recebi a foto!');
  });
});

describe('gerarMensagemEstimativa', () => {
  test('gera estimativa para sofá', () => {
    const msg = gerarMensagemEstimativa({ tipo: 'sofa', lugares: 3 });
    expect(msg).toContain('R$');
    expect(msg).toContain('150');
  });

  test('gera estimativa para ar', () => {
    const msg = gerarMensagemEstimativa({ tipo: 'ar_condicionado', modelo_ar: 'split' });
    expect(msg).toContain('R$');
    expect(msg).toContain('120');
  });

  test('retorna null sem dados suficientes', () => {
    expect(gerarMensagemEstimativa(null)).toBeNull();
    expect(gerarMensagemEstimativa({ tipo: 'outro' })).toBeNull();
  });
});
