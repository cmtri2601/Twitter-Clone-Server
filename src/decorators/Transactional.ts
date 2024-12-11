import database from '~/database';

export default function Transactional(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  // get original function
  const fn = descriptor.value;

  // create new function that wrap original function with transaction and
  const newFn = async function (this: any, ...args: any) {
    // create session of mongodb
    const session = database.client.startSession();
    let result;
    try {
      // start transaction
      session.startTransaction();

      // inject session to original function
      result = await fn.call(this, ...args, session);

      // commit transaction
      await session.commitTransaction();
    } catch (error) {
      // abort transaction if error
      await session.abortTransaction();

      // rethrow error for application handle
      throw error;
    } finally {
      // end session
      await session.endSession();
    }

    // return result to the caller
    return result;
  };

  // assign new function to descriptor
  descriptor.value = newFn;
}

/**
 * The driver provides two APIs for performing transactions, the Core API and the Convenient Transaction API.
 *
 * The Core API is a framework that enables you to create, commit, and end transactions. When using this API, you must explicitly perform the following actions:
 *  - Create, commit, and end the transaction.
 *  - Create and end the session in which you run the transaction.
 *  - Implement error-handling logic.
 *
 * The Convenient Transaction API is a framework that enables you to perform transactions without being responsible for committing or ending them. This API automatically incorporates error-handling logic to retry operations when the server raises certain error types.
 */

/**
 * Why need to put session of MongoDb in Node.js but not in Java?
 * Asynchronous vs. Synchronous:
 *  - Node.js: Asynchronous, non-blocking operations require explicit session management to maintain transaction state across multiple asynchronous calls.
 *  - Java: Synchronous, blocking operations allow the driver to implicitly manage the transaction context.
 *
 * Session Management:
 *  - Node.js: Requires explicit session objects to manage transactions.
 *  - Java: Manages transaction context internally, simplifying the API for synchronous operations.
 */

/**
 * Why PostgresSQL does not need session management?
 *
 * PostgreSQL is a relational database that follows the ACID (Atomicity, Consistency, Isolation, Durability) properties for transactions. In PostgreSQL, transactions are managed at the connection level. When you start a transaction, it is associated with the current connection, and all subsequent operations on that connection are part of the transaction until it is committed or rolled back.
 * MongoDB is a NoSQL database that traditionally did not support multi-document transactions. With the introduction of multi-document transactions in MongoDB 4.0, transactions are managed using sessions. A session object is required to maintain the state of the transaction across multiple operations and collections.
 *
 * Key Differences
 *    Transaction Management:
 *      - PostgreSQL: Transactions are managed at the connection level. Once a transaction is started, all operations on that connection are part of the transaction.
 *      - MongoDB: Transactions are managed using session objects. Each operation within the transaction must be associated with the session.
 *
 *    Database Design:
 *      - PostgreSQL: A relational database with built-in support for ACID transactions.
 *      - MongoDB: A NoSQL database that added support for multi-document transactions in later versions, requiring explicit session management.
 *
 *    Driver Architecture:
 *      - PostgreSQL: The driver manages transactions implicitly through the connection.
 *      - MongoDB: The driver requires explicit session objects to manage transactions.
 * Summary
 *    PostgreSQL: Transactions are managed at the connection level, and the driver handles them implicitly.
 *    MongoDB: Transactions require explicit session objects to maintain state across multiple operations and collections.
 */

/**
 * Ref: https://www.mongodb.com/docs/drivers/node/current/fundamentals/transactions/#transaction-apis
 */
