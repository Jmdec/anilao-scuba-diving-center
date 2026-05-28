import Image from "next/image"

interface CertificateTemplateProps {
  userName: string
  certificationName: string
  completionDate: string
  certificateId: string
}

export default function CertificateTemplate({
  userName,
  certificationName,
  completionDate,
  certificateId,
}: CertificateTemplateProps) {
  return (
    <div className="w-[800px] h-[600px] bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden font-serif">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-2">
        <div className="w-full h-full bg-white rounded-lg shadow-2xl"></div>
      </div>

      <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-blue-600 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-blue-600 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-blue-600 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-blue-600 rounded-br-lg"></div>

      <div className="absolute top-8 left-8 z-20">
        <Image
          src="/logo.jpg"
          alt="Organization Logo"
          width={100}
          height={100}
          className="object-contain rounded-full shadow-lg border-2 border-blue-200"
        />
      </div>

      <div className="absolute inset-0 opacity-3">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-transparent to-cyan-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-blue-100 rotate-45 select-none">
          CERTIFIED
        </div>
      </div>

      {/* Certificate content */}
      <div className="relative z-10 text-center h-full flex flex-col justify-center px-12 py-8">
        <div className="mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
            CERTIFICATE
          </h1>
          <h2 className="text-2xl font-semibold text-blue-700 tracking-wider">OF COMPLETION</h2>
        </div>

        <div className="text-lg text-gray-600 mb-6 italic">This is to certify that</div>

        <div className="text-4xl font-bold text-blue-900 mb-8 relative">
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
          {userName}
        </div>

        <div className="text-lg text-gray-600 mb-4 italic">has successfully completed the</div>

        <div className="text-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 rounded-lg shadow-lg mb-8 mx-8">
          {certificationName}
        </div>

        <div className="text-lg text-gray-600 mb-8">
          Completed on <span className="font-semibold text-blue-800">{completionDate}</span>
        </div>

        <div className="flex justify-between items-end mt-auto px-8">
          <div className="text-center flex-1">
            <div className="mb-4">
              <Image
                src="/signature.png"
                alt="Instructor Signature"
                width={150}
                height={60}
                className="object-contain mx-auto"
              />
            </div>
            <div className="border-t-2 border-blue-400 w-48 mb-2 mx-auto"></div>
            <div className="text-sm font-semibold text-blue-700">Certified Instructor</div>
            <div className="text-xs text-gray-500">Professional Certification</div>
          </div>

          <div className="text-center flex-1">
            <div className="bg-blue-100 px-4 py-3 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-800">Certificate ID</div>
              <div className="text-lg font-mono text-blue-900">{certificateId}</div>
              <div className="text-xs text-gray-600 mt-1">Issued: {completionDate}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-white text-xs font-bold text-center leading-tight">
              OFFICIAL
              <br />
              CERT
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
