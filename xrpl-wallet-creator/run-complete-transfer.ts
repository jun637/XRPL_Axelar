/*
🚀 XRPL ↔ Axelar 크로스체인 전송 완전 실행 스크립트

이 스크립트는 Step 1부터 Step 9까지 모든 단계를 순차적으로 실행합니다.
(Step 7: 검증자 네트워크 검증은 제거됨 - SDK가 자동 처리)
*/

import { XRPLConnection } from './step1_xrpl_connection'
import { BalanceChecker } from './step2_balance_check'
import { AdminToUserXRPIssuer } from './step3_admin_to_user_xrp_issue'
import { AxelarGatewayProcessor } from './step4_user_to_gateway_payment'
import { ITSCrossChainTransfer } from './step5_its_cross_chain_transfer'
import { GMPMessageTransmission } from './step6_gmp_message_transmission'
import { ITSContractExecution } from './step7_its_contract_execution'
import { FinalVerification } from './step8_final_verification'

class CompleteTransferExecutor {
  private transferId: string
  private transferParams: any
  private stepResults: Map<string, any>

  constructor() {
    this.transferId = this.generateTransferId()
    this.stepResults = new Map()
    
    // 전송 파라미터 설정
    this.transferParams = {
      sourceChain: 'xrpl',
      destinationChain: 'ethereum',
      sourceAddress: 'rHaHfYw5Krxy6cUee5FpsBv3tLqp1DvYwP', // Admin 지갑
      destinationAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Ethereum 주소
      userAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // User 지갑
      tokenSymbol: 'XRP',
      amount: '10',
      originalBalance: '100.0',
      userEmail: 'user@example.com',
      userId: 'user123',
      webhookUrl: 'https://api.example.com/webhook'
    }
  }

  private generateTransferId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `its-${timestamp}-${random}`
  }

  async executeCompleteTransfer(): Promise<boolean> {
    console.log('🚀 XRPL ↔ Axelar 크로스체인 전송 시작')
    console.log('='.repeat(60))
    console.log(`🆔 전송 ID: ${this.transferId}`)
    console.log(`💰 전송 금액: ${this.transferParams.amount} ${this.transferParams.tokenSymbol}`)
    console.log(`👑 Admin 지갑: ${this.transferParams.sourceAddress}`)
    console.log(`👤 User 지갑: ${this.transferParams.userAddress}`)
    console.log(`🎯 최종 목적지: ${this.transferParams.destinationAddress} (Ethereum)`)
    console.log('='.repeat(60))
    console.log()

    try {
      // Step 1: XRPL 연결
      console.log('📋 Step 1: XRPL 연결')
      const xrplConnection = new XRPLConnection()
      await xrplConnection.connect()
      await xrplConnection.loadWallets()
      this.stepResults.set('step1', true)
      console.log('✅ Step 1 완료\n')

      // Step 2: 잔액 확인
      console.log('📋 Step 2: 잔액 확인')
      const wallets = xrplConnection.getWallets()
      const { Client } = await import('xrpl')
      const xrplClient = new Client('wss://s.altnet.rippletest.net:51233')
      await xrplClient.connect()
      const balanceChecker = new BalanceChecker(xrplClient, wallets.admin, wallets.user)
      const balanceResult = await balanceChecker.checkXRPBalances()
      this.stepResults.set('step2', balanceResult)
      console.log('✅ Step 2 완료\n')

      // Step 3: Admin → User XRP 발행
      console.log('📋 Step 3: Admin → User XRP 발행')
      const xrpIssuer = new AdminToUserXRPIssuer(xrplClient, wallets.admin, wallets.user)
      const issueResult = await xrpIssuer.issueXRPToUser(this.transferParams.amount)
      this.stepResults.set('step3', issueResult)
      console.log('✅ Step 3 완료\n')

      // Step 4: User → Axelar Gateway 전송
      console.log('📋 Step 4: User → Axelar Gateway 전송')
      const gatewayProcessor = new AxelarGatewayProcessor()
      const memoData = { 
        userAddress: this.transferParams.userAddress,
        destination: this.transferParams.destinationAddress, 
        amount: this.transferParams.amount
      }
      await gatewayProcessor.processGatewayTransaction(issueResult, memoData)
      this.stepResults.set('step4', true)
      console.log('✅ Step 4 완료\n')

      // Step 5: ITS 토큰 등록 확인 및 크로스체인 전송
      console.log('📋 Step 5: ITS 토큰 등록 확인 및 크로스체인 전송')
      const crossChainTransfer = new ITSCrossChainTransfer()
      const crossChainResult = await crossChainTransfer.requestInterchainTransfer(this.transferParams)
      this.stepResults.set('step5', crossChainResult)
      console.log('✅ Step 5 완료\n')

      // Step 6: GMP 메시지 전송
      console.log('📋 Step 6: GMP 메시지 전송')
      const gmpTransmission = new GMPMessageTransmission()
      const gmpResult = await gmpTransmission.sendGMPMessage(this.transferParams)
      this.stepResults.set('step6', gmpResult)
      console.log('✅ Step 6 완료\n')

      // Step 7: ITS 컨트랙트 실행
      console.log('📋 Step 7: ITS 컨트랙트 실행')
      const contractExecution = new ITSContractExecution()
      const contractResult = await contractExecution.executeITSContract(this.transferParams)
      this.stepResults.set('step7', contractResult)
      console.log('✅ Step 7 완료\n')

      // Step 8: 최종 확인
      console.log('📋 Step 8: 최종 확인')
      const finalVerification = new FinalVerification()
      const verificationResult = await finalVerification.performFinalVerification(this.transferId, this.transferParams)
      this.stepResults.set('step8', verificationResult)
      console.log('✅ Step 8 완료\n')

      // 최종 리포트 생성
      console.log('📋 최종 리포트 생성')
      const report = await finalVerification.generateFinalReport(this.transferId, this.transferParams)
      console.log('\n' + report)

      // 완료 알림 전송
      console.log('📋 완료 알림 전송')
      await finalVerification.sendCompletionNotification(this.transferId, this.transferParams)

      console.log('\n🎉 모든 단계가 성공적으로 완료되었습니다!')
      return true

    } catch (error) {
      console.error('\n❌ 크로스체인 전송 실패:', error)
      console.log('\n📊 실패한 단계 정보:')
      
      // 실패한 단계 정보 출력
      for (const [step, result] of this.stepResults.entries()) {
        console.log(`${step}: ${result ? '✅ 성공' : '❌ 실패'}`)
      }
      
      return false
    }
  }

  getStepResults(): Map<string, any> {
    return this.stepResults
  }

  getTransferId(): string {
    return this.transferId
  }

  getTransferParams(): any {
    return this.transferParams
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 XRPL ↔ Axelar 크로스체인 전송 시스템')
  console.log('='.repeat(60))
  
  const executor = new CompleteTransferExecutor()
  
  try {
    const success = await executor.executeCompleteTransfer()
    
    if (success) {
      console.log('\n🎯 전송 상태: 성공')
      console.log(`🆔 전송 ID: ${executor.getTransferId()}`)
      console.log('📊 모든 단계가 정상적으로 완료되었습니다.')
    } else {
      console.log('\n❌ 전송 상태: 실패')
      console.log('🔧 문제 해결을 위해 로그를 확인하세요.')
    }
    
  } catch (error) {
    console.error('\n💥 치명적 오류 발생:', error)
    console.log('🔧 시스템을 다시 시작하거나 관리자에게 문의하세요.')
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export { CompleteTransferExecutor } 