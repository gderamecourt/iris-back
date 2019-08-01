import { INestApplication } from '@nestjs/common'
import { ModuleMetadata } from '@nestjs/common/interfaces'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import '@u-iris/iris-common-test-utils'
import * as request from 'superagent'
import { ExceptionFilter } from '../../src/filters'
import { cleanApplicationContext, setApplicationContext } from '../../src/modules/iris-module'
import { LoggingInterceptor, TraceContextInterceptor } from '../../src/modules/iris-module/interceptors'

export class TestUtils {

  public static expectErreurReturned(response: request.Response, ...erreurs: Array<{ champErreur?: string, codeErreur?: string, libelleErreur?: string }>) {
    expect(response.body).toBeDefined()
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors).toBeInstanceOf(Array)
    expect(response.body.errors).toHaveLength(erreurs.length)
    for (const err of erreurs) {
      expect(response.body.errors).toContainObjectLike(err)
    }
  }

  public static async bootstrapNestJS(metadata: ModuleMetadata): Promise<{ app: INestApplication, module: TestingModule }> {
    if (!metadata.providers) {
      metadata.providers = []
    }
    metadata.providers.unshift({
        provide: APP_INTERCEPTOR,
        useClass: TraceContextInterceptor,
      }, {
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      },
      {
        provide: APP_FILTER,
        useClass: ExceptionFilter,
      })
    const module: TestingModule = await Test.createTestingModule(metadata).compile()
    const app = TestUtils.constructApplicationFromModule(module)
    return { app, module }
  }

  public static constructApplicationFromModule(module: TestingModule) {
    const app = module.createNestApplication()
    setApplicationContext(app)
    // app.useGlobalInterceptors(new TraceContextInterceptor()) // error handler
    app.useGlobalFilters(new ExceptionFilter()) // error handler
    return app
  }

  public static cleanApplication() {
    cleanApplicationContext()
  }
}