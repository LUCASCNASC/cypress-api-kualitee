// Testes automatizados para API: POST /test_case/approve
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/TestCase/Approved'

describe('API - Test Case Approve - /test_case/approve', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validTestcaseIds = [1001, 1002]; // Substitua por ids de casos de teste válidos

  // Função utilitária para chamada da API
  function testCaseApprove(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: Aprovar um caso de teste ---
  it('Aprova um caso de teste', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1', // 1=Approved
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Aprovar múltiplos casos de teste ---
  it('Aprova múltiplos casos de teste', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      tc_status: '1'
    };
    validTestcaseIds.forEach((id, i) => body[`testcase_id[${i}]`] = id);
    testCaseApprove(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Rejeitar um caso de teste ---
  it('Rejeita um caso de teste', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '2', // 2=Rejected
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    testCaseApprove({
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testCaseApprove({
        token,
        project_id: validProjectId,
        tc_status: '1',
        'testcase_id[0]': validTestcaseIds[0]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  it('Falha sem project_id', () => {
    testCaseApprove({
      token: validToken,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem tc_status', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem testcase_id[0]', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'testcase_id[0]'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          tc_status: '1',
          'testcase_id[0]': validTestcaseIds[0]
        };
        body[field] = value;
        testCaseApprove(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- tc_status inválido ---
  ['0', '3', 'aprovado', '', null, undefined].forEach(tc_status => {
    it(`Falha com tc_status inválido (${JSON.stringify(tc_status)})`, () => {
      testCaseApprove({
        token: validToken,
        project_id: validProjectId,
        tc_status,
        'testcase_id[0]': validTestcaseIds[0]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0],
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          tc_status: '1',
          'testcase_id[0]': validTestcaseIds[0]
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_status: '1',
        'testcase_id[0]': validTestcaseIds[0]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseApprove({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseApprove(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite aprovações duplicadas rapidamente', () => {
    testCaseApprove({
      token: validToken,
      project_id: validProjectId,
      tc_status: '1',
      'testcase_id[0]': validTestcaseIds[0]
    })
      .then(() => testCaseApprove({
        token: validToken,
        project_id: validProjectId,
        tc_status: '1',
        'testcase_id[0]': validTestcaseIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});