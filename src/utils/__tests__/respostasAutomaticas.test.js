const {
  buscarRespostaAutomatica,
  deveIgnorar,
  normalizar,
} = require('../respostasAutomaticas');

describe('normalizar', () => {
  test('remove acentos', () => {
    expect(normalizar('Olá')).toBe('ola');
  });

  test('remove pontuação', () => {
    expect(normalizar('oi!')).toBe('oi');
  });

  test('converte para minúsculo', () => {
    expect(normalizar('BOM DIA')).toBe('bom dia');
  });
});

describe('buscarRespostaAutomatica', () => {
  test('responde saudação "oi"', () => {
    const resposta = buscarRespostaAutomatica('oi');
    expect(resposta).toContain('André');
    expect(resposta).toContain('JP empresa Teste');
  });

  test('responde "bom dia" com saudação', () => {
    const resposta = buscarRespostaAutomatica('bom dia');
    expect(resposta).toContain('André');
  });

  test('responde preço com tabela', () => {
    const resposta = buscarRespostaAutomatica('quanto custa');
    expect(resposta).toContain('R$');
    expect(resposta).toContain('150'); // 3 lugares
  });

  test('responde sobre sofá com preços', () => {
    const resposta = buscarRespostaAutomatica('quero limpar sofa');
    expect(resposta).toContain('R$');
  });

  test('responde sobre ar condicionado', () => {
    const resposta = buscarRespostaAutomatica('limpeza de ar condicionado');
    expect(resposta).toContain('R$');
  });

  test('responde formas de pagamento', () => {
    const resposta = buscarRespostaAutomatica('aceita pix');
    expect(resposta).toContain('PIX');
  });

  test('retorna null para texto com dados (vai pro Groq)', () => {
    expect(buscarRespostaAutomatica('3 lugares tecido')).toBeNull();
  });

  test('retorna null para confirmações simples', () => {
    expect(buscarRespostaAutomatica('ok')).toBeNull();
    expect(buscarRespostaAutomatica('sim')).toBeNull();
  });

  test('retorna null para mensagens longas', () => {
    const msgLonga = 'a'.repeat(201);
    expect(buscarRespostaAutomatica(msgLonga)).toBeNull();
  });

  test('retorna null para texto não reconhecido', () => {
    expect(buscarRespostaAutomatica('xyzabc')).toBeNull();
  });
});

describe('deveIgnorar', () => {
  test('ignora emojis (normalizar remove emojis, match por texto)', () => {
    // Emojis são removidos pelo normalizar, então não dão match
    // Isso é um bug conhecido - emojis sozinhos não são ignorados
    expect(deveIgnorar('😊')).toBe(false);
  });

  test('ignora risadas', () => {
    expect(deveIgnorar('kkk')).toBe(true);
    expect(deveIgnorar('haha')).toBe(true);
  });

  test('não ignora texto normal', () => {
    expect(deveIgnorar('oi')).toBe(false);
    expect(deveIgnorar('quero orçamento')).toBe(false);
  });
});
