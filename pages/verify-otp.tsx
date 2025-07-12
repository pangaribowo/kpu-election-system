import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useVoting } from '../components/VotingContext'

const VerifyOtpPage = () => {
  const router = useRouter()
  const { setCurrentUser, setActiveTab, setNotification } = useVoting()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const phone = typeof router.query.phone === 'string' ? router.query.phone : ''

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !phone) {
      setNotification({ message: 'Masukkan kode OTP dan nomor HP!', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) {
        setNotification({ message: error.message || 'OTP salah atau kadaluarsa', type: 'error' })
      } else {
        // Ambil data user dari user_metadata
        const userMeta = data.user?.user_metadata || {}
        setCurrentUser({ username: userMeta.username, role: userMeta.role, name: userMeta.name, email: data.user?.email, phone: data.user?.phone || phone, phone_verified: true })
        setActiveTab('voting')
        setNotification({ message: 'Login via OTP berhasil!', type: 'success' })
        router.replace('/')
      }
    } catch (err) {
      setNotification({ message: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-otp-container">
      <h2>Verifikasi OTP</h2>
      <div className="coming-soon-box" style={{padding:24,background:'#fffbe6',border:'2px solid #ffe066',borderRadius:8,marginBottom:24,textAlign:'center'}}>
        <span style={{fontSize:20,fontWeight:600,color:'#b59f00'}}>Fitur verifikasi nomor HP/OTP akan segera hadir (Coming Soon)</span>
      </div>
      <form className="login-form" onSubmit={e => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="otp">Masukkan Kode OTP:</label>
          <input type="text" id="otp" value={otp} disabled placeholder="Kode OTP dari SMS" />
        </div>
        <button type="button" className="btn-primary" disabled>Coming Soon</button>
      </form>
      <div style={{ marginTop: 16, color: '#666' }}>
        Kode OTP telah dikirim ke nomor HP: <b>{phone}</b>
      </div>
    </div>
  )
}

export default VerifyOtpPage 