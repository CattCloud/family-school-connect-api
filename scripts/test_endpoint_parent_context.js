async function testEndpointParentContext() {
  try {
    console.log('🔍 Probando endpoint /auth/parent-context/:user_id...\n');
    
    // Primero, iniciar sesión como padre para obtener el token
    console.log('📝 Iniciando sesión como padre...');
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo_documento: 'DNI',
        nro_documento: '88888888',
        password: '123456789'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Error en login:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('✅ Login exitoso:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.nombre} ${user.apellido}`);
    console.log(`   Rol: ${user.rol}\n`);
    
    // Ahora probar el endpoint de parent-context
    console.log('📋 Obteniendo contexto del padre...');
    const parentContextResponse = await fetch(`http://localhost:3000/auth/parent-context/${user.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const parentContextData = await parentContextResponse.json();
    
    if (parentContextData.success) {
      const data = parentContextData.data;
      console.log('✅ Endpoint funcionando correctamente:');
      console.log(`   Total hijos: ${data.total_hijos}`);
      
      if (data.hijos && data.hijos.length > 0) {
        console.log('\n📝 Lista de hijos:');
        data.hijos.forEach((hijo, index) => {
          console.log(`   Hijo ${index + 1}:`);
          console.log(`   - ID: ${hijo.id}`);
          console.log(`   - Nombre: ${hijo.nombre_completo}`);
          console.log(`   - Código: ${hijo.codigo_estudiante}`);
          console.log(`   - Nivel-grado: ${hijo.nivel_grado.nivel} ${hijo.nivel_grado.grado}`);
          console.log(`   - Estado matrícula: ${hijo.estado_matricula}\n`);
        });
      } else {
        console.log('❌ No se encontraron hijos');
      }
    } else {
      console.log('❌ Error en respuesta:', parentContextData);
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error.message);
  }
}

testEndpointParentContext();