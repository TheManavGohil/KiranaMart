import { NextResponse } from 'next/server';
import clientPromise, { getDb, getVendorCollection, getCustomerCollection, COLLECTIONS } from '@/lib/mongodb';

export async function GET() {
  console.log('Database test route called');
  
  const response = {
    success: false,
    messages: [] as string[],
    dbConnectionStatus: false,
    mongoUriExists: !!process.env.MONGODB_URI,
    mongoUriPreview: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'Not set',
    collections: {
      vendors: { exists: false, count: 0 },
      customers: { exists: false, count: 0 },
      products: { exists: false, count: 0 },
      orders: { exists: false, count: 0 },
    },
    testDocumentId: null
  };

  try {
    // Test MongoDB client connection
    console.log('Testing MongoDB client connection...');
    const client = await clientPromise;
    response.dbConnectionStatus = !!client;
    response.messages.push('MongoDB client connection successful');
    
    // Access the database
    console.log('Accessing database...');
    const db = await getDb();
    response.messages.push('Database access successful');
    
    // Check collections and count documents
    console.log('Checking collections...');
    
    try {
      const vendorCollection = await getVendorCollection();
      response.collections.vendors.exists = true;
      response.collections.vendors.count = await vendorCollection.countDocuments();
      response.messages.push(`Vendors collection exists with ${response.collections.vendors.count} documents`);
    } catch (err) {
      response.messages.push(`Error accessing vendors collection: ${err.message}`);
    }
    
    try {
      const customerCollection = await getCustomerCollection();
      response.collections.customers.exists = true;
      response.collections.customers.count = await customerCollection.countDocuments();
      response.messages.push(`Customers collection exists with ${response.collections.customers.count} documents`);
    } catch (err) {
      response.messages.push(`Error accessing customers collection: ${err.message}`);
    }
    
    // Check for other collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    response.messages.push(`Available collections: ${collectionNames.join(', ')}`);
    
    // Insert a test document
    console.log('Inserting test document...');
    const testCollection = db.collection('connection_tests');
    const testResult = await testCollection.insertOne({
      test: 'Connection test',
      timestamp: new Date(),
      collectionsFound: collectionNames
    });
    
    response.testDocumentId = testResult.insertedId.toString();
    response.messages.push(`Test document inserted with ID: ${response.testDocumentId}`);
    response.success = true;
    
  } catch (error) {
    console.error('Database test failed:', error);
    response.messages.push(`Database test failed: ${error.message}`);
  }
  
  return NextResponse.json(response);
} 