const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function testStorageUpload(): Promise<void> {
  console.log('=== STORAGE TEST START ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

  try {
    const testContent = 'This is a test file';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    const bucketName = 'certificates';

    console.log('Test file:', fileName);
    console.log('Blob size:', testBlob.size);

    const formData = new FormData();
    formData.append('file', testBlob, fileName);

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
    console.log('Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
      console.log('✅ SUCCESS! File uploaded to:', publicUrl);
      alert(`✅ Storage test PASSED!\n\nFile uploaded successfully to:\n${publicUrl}\n\nCheck console for details.`);
    } else {
      console.error('❌ FAILED! Upload failed with status:', response.status);
      alert(`❌ Storage test FAILED!\n\nStatus: ${response.status}\nError: ${responseText}\n\nCheck console for details.`);
    }

  } catch (error) {
    console.error('❌ EXCEPTION during storage test:', error);
    alert(`❌ Storage test EXCEPTION!\n\n${error}\n\nCheck console for details.`);
  }

  console.log('=== STORAGE TEST END ===');
}

export async function testPDFGeneration(): Promise<void> {
  console.log('=== PDF GENERATION TEST START ===');

  try {
    const { jsPDF } = await import('jspdf');

    console.log('Creating test PDF...');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    pdf.text('Test PDF', 20, 20);
    pdf.text('This is a test certificate PDF', 20, 40);

    const pdfBlob = pdf.output('blob');
    console.log('PDF blob created, size:', pdfBlob.size);

    const fileName = `test-pdf-${Date.now()}.pdf`;
    const bucketName = 'certificates';

    console.log('Uploading PDF to storage...');
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
    console.log('Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
      console.log('✅ SUCCESS! PDF uploaded to:', publicUrl);
      alert(`✅ PDF test PASSED!\n\nPDF uploaded successfully to:\n${publicUrl}\n\nTry opening this URL in a new tab to verify.`);
    } else {
      console.error('❌ FAILED! PDF upload failed');
      alert(`❌ PDF test FAILED!\n\nStatus: ${response.status}\nError: ${responseText}`);
    }

  } catch (error) {
    console.error('❌ EXCEPTION during PDF test:', error);
    alert(`❌ PDF test EXCEPTION!\n\n${error}`);
  }

  console.log('=== PDF GENERATION TEST END ===');
}
